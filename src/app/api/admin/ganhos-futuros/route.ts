import { NextResponse } from 'next/server';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    // Buscar todas as locações
    const locacoesSnapshot = await getDocs(collection(db, 'locacoes'));
    const locacoes = locacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filtrar locações não concluídas (status diferente de 'concluida' e 'cancelada')
    const locacoesNaoConcluidas = locacoes.filter((l: any) => 
      l.status_locacao !== 'concluida' && l.status_locacao !== 'cancelada'
    );

    // Filtrar por período se fornecido
    let locacoesFiltradas = locacoesNaoConcluidas;
    if (dataInicio && dataFim) {
      locacoesFiltradas = locacoesNaoConcluidas.filter((l: any) => {
        const dataEvento = new Date(l.data_evento);
        return dataEvento >= new Date(dataInicio) && dataEvento <= new Date(dataFim);
      });
    } else {
      // Se não fornecido período, buscar apenas locações futuras (a partir de hoje)
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      locacoesFiltradas = locacoesNaoConcluidas.filter((l: any) => {
        const dataEvento = new Date(l.data_evento);
        return dataEvento >= hoje;
      });
    }

    // Calcular ganhos futuros
    const ganhosTotais = locacoesFiltradas.reduce((sum: number, l: any) => {
      const valorTotal = l.valor_total || 0;
      const sinalPago = l.sinal_pago || 0;
      const status = l.status_pagamento || 'pendente';

      // Considerar o valor pendente (valor total - sinal já pago)
      let valorPendente = valorTotal - sinalPago;
      
      if (status === 'pago') {
        valorPendente = 0; // Já pago tudo
      } else if (status === 'parcial' || status === 'parcialmente_pago') {
        valorPendente = valorTotal - sinalPago; // Faltando o restante
      }
      // Se pendente, considera o valor total como ganho futuro

      return sum + valorPendente;
    }, 0);

    // Total bruto das locações
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
