import { NextResponse } from 'next/server';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('📊 [API CAIXA] Calculando saldo em caixa...');

    // Buscar todas as locações
    const locacoesSnapshot = await getDocs(collection(db, 'locacoes'));
    const locacoes = locacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📊 [API CAIXA] Total de locações: ${locacoes.length}`);

    // Buscar todas as transações financeiras
    const transacoesSnapshot = await getDocs(collection(db, 'transacoes'));
    const transacoes = transacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📊 [API CAIXA] Total de transações: ${transacoes.length}`);

    // Calcular entradas de locações (usando mesma lógica do dashboard)
    const totalLocacoes = locacoes.reduce((sum: number, l: any) => {
      const sinalPago = l.sinal_pago || 0;
      const valorTotal = l.valor_total || 0;
      
      if (l.status_pagamento === 'pago') {
        return sum + valorTotal;
      } else if (l.status_pagamento === 'parcial' || l.status_pagamento === 'parcialmente_pago') {
        return sum + sinalPago;
      } else if (l.status_pagamento === 'pendente') {
        return sum;
      } else {
        return sum + sinalPago;
      }
    }, 0);
    console.log(`📊 [API CAIXA] Total locações (pagas): R$ ${totalLocacoes.toFixed(2)}`);

    // Calcular transações financeiras (usando mesma lógica do dashboard)
    const totalInjecaoCapitalBruto = transacoes
      .filter((t: any) => t.tipo === 'injecao_capital')
      .reduce((sum: number, t: any) => sum + (t.valor || 0), 0);
    console.log(`📊 [API CAIXA] Injeções de capital (bruto): R$ ${totalInjecaoCapitalBruto.toFixed(2)}`);

    const totalDevolucaoCapital = transacoes
      .filter((t: any) => t.tipo === 'devolucao_capital')
      .reduce((sum: number, t: any) => sum + (t.valor || 0), 0);
    console.log(`📊 [API CAIXA] Devoluções de capital: R$ ${totalDevolucaoCapital.toFixed(2)}`);

    const totalInjecaoCapital = totalInjecaoCapitalBruto - totalDevolucaoCapital;
    console.log(`📊 [API CAIXA] Injeções de capital (líquido): R$ ${totalInjecaoCapital.toFixed(2)}`);

    const totalGastos = transacoes
      .filter((t: any) => t.tipo === 'gasto')
      .reduce((sum: number, t: any) => sum + (t.valor || 0), 0);
    console.log(`📊 [API CAIXA] Gastos: R$ ${totalGastos.toFixed(2)}`);

    const totalInvestimentos = transacoes
      .filter((t: any) => t.tipo === 'investimento')
      .reduce((sum: number, t: any) => sum + (t.valor || 0), 0);
    console.log(`📊 [API CAIXA] Investimentos: R$ ${totalInvestimentos.toFixed(2)}`);

    // Calcular saldo em caixa: Injeções (líquido) + Locações - Gastos - Investimentos
    // Nota: Devoluções já estão descontadas das injeções líquidas
    const saldoEmCaixa = totalInjecaoCapital + totalLocacoes - totalGastos - totalInvestimentos;
    console.log(`📊 [API CAIXA] Saldo em caixa FINAL: R$ ${saldoEmCaixa.toFixed(2)}`);

    return NextResponse.json({
      saldoEmCaixa,
      detalhes: {
        totalInjecaoCapital, // Valor líquido
        totalInjecaoCapitalBruto, // Valor bruto (para informação)
        totalDevolucaoCapital, // Devoluções (para informação)
        totalLocacoes,
        totalGastos,
        totalInvestimentos,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('❌ [API CAIXA] Erro ao calcular saldo em caixa:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular saldo em caixa' },
      { status: 500 }
    );
  }
}
