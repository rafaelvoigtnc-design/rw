import { NextResponse } from 'next/server';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const tipoPeriodo = searchParams.get('tipo') || 'futuro_geral'; // futuro_geral, passado, futuro, customizado

    // Buscar todas as locações
    const locacoesSnapshot = await getDocs(collection(db, 'locacoes'));
    const locacoes = locacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filtrar canceladas (não entram em nenhum cálculo)
    const locacoesValidas = locacoes.filter((l: any) => 
      l.status_locacao !== 'cancelada'
    );

    let locacoesFiltradas = locacoesValidas;

    if (tipoPeriodo === 'futuro_geral') {
      // Período total: tudo que já foi pago + o que ainda vai entrar (pagos, parciais, pendentes)
      // Exclui apenas canceladas
      locacoesFiltradas = locacoesValidas; // Já filtrou canceladas acima
    } else if (dataInicio && dataFim) {
      // Personalizado: filtrar por data do evento no período selecionado
      locacoesFiltradas = locacoesValidas.filter((l: any) => {
        const dataEvento = new Date(l.data_evento);
        return dataEvento >= new Date(dataInicio) && dataEvento <= new Date(dataFim);
      });
    } else if (tipoPeriodo === 'passado') {
      // Mês passado: tudo que entrou no mês passado (pagos, parciais, pendentes)
      // Filtra por data do evento no mês passado
      const hoje = new Date();
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      locacoesFiltradas = locacoesValidas.filter((l: any) => {
        const dataEvento = new Date(l.data_evento);
        return dataEvento >= inicio && dataEvento <= fim;
      });
    } else if (tipoPeriodo === 'futuro') {
      // Mês que vem: tudo que vai entrar no mês que vem (pagos, parciais, pendentes)
      // Filtra por data do evento no próximo mês
      const hoje = new Date();
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0);
      locacoesFiltradas = locacoesValidas.filter((l: any) => {
        const dataEvento = new Date(l.data_evento);
        return dataEvento >= inicio && dataEvento <= fim;
      });
    } else {
      // Default: locações futuras a partir de hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      locacoesFiltradas = locacoesValidas.filter((l: any) => {
        const dataEvento = new Date(l.data_evento);
        return dataEvento >= hoje;
      });
    }

    // Calcular ganhos
    const ganhosTotais = locacoesFiltradas.reduce((sum: number, l: any) => {
      const valorTotal = l.valor_total || 0;
      const sinalPago = l.sinal_pago || 0;
      const status = l.status_pagamento || 'pendente';

      // Valor pendente (o que ainda vai entrar)
      let valorPendente = valorTotal - sinalPago;
      
      if (status === 'pago') {
        valorPendente = 0; // Já pago tudo
      } else if (status === 'parcial' || status === 'parcialmente_pago') {
        valorPendente = valorTotal - sinalPago; // Faltando o restante
      }
      // Se pendente, considera o valor total como ganho futuro

      return sum + valorPendente;
    }, 0);

    // Total bruto das locações (valor total das locações selecionadas)
    const valorBruto = locacoesFiltradas.reduce((sum: number, l: any) => sum + (l.valor_total || 0), 0);

    // Total já recebido (sinais)
    const valorRecebido = locacoesFiltradas.reduce((sum: number, l: any) => sum + (l.sinal_pago || 0), 0);

    return NextResponse.json({
      locacoes: locacoesFiltradas,
      ganhosTotais,
      valorBruto,
      valorRecebido,
      quantidade: locacoesFiltradas.length,
    });
  } catch (error) {
    console.error('Erro ao buscar ganhos futuros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ganhos futuros' },
      { status: 500 }
    );
  }
}
