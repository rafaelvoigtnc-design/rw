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
    } else if (tipoPeriodo === 'customizado' && dataInicio && dataFim) {
      // Personalizado: filtrar por data do evento no período selecionado
      locacoesFiltradas = locacoesValidas.filter((l: any) => {
        const dataEvento = new Date(l.data_evento);
        return dataEvento >= new Date(dataInicio) && dataEvento <= new Date(dataFim);
      });
    } else if (tipoPeriodo === 'passado') {
      // Mês passado: apenas o que já entrou (pagos e parciais)
      // Filtra por data do evento no mês passado
      const hoje = new Date();
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      locacoesFiltradas = locacoesValidas.filter((l: any) => {
        const dataEvento = new Date(l.data_evento);
        const status = l.status_pagamento || 'pendente';
        // Apenas pagos e parciais, exclui pendentes
        return dataEvento >= inicio && dataEvento <= fim &&
               (status === 'pago' || status === 'parcial' || status === 'parcialmente_pago');
      });
    } else if (tipoPeriodo === 'este_mes') {
      // Este mês: tudo que entra neste mês (pagos, parciais, pendentes)
      // Filtra por data do evento no mês atual
      const hoje = new Date();
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
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
    } else if (tipoPeriodo === 'futuro_mais_1') {
      // Mês que vem +1: tudo que vai entrar no mês que vem +1 (pagos, parciais, pendentes)
      // Filtra por data do evento no mês que vem +1
      const hoje = new Date();
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 3, 0);
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

      // Calcular ganhos totais e valor bruto conforme o período
    let ganhosTotais = 0;
    let valorBruto = 0;

    if (tipoPeriodo === 'passado') {
      // Mês passado: ganhos totais = pagos (valor total) + parciais (valor total)
      // Valor recebido = pagos (valor total) + parciais (apenas o sinal pago)
      locacoesFiltradas.forEach((l: any) => {
        const valorTotal = l.valor_total || 0;
        const sinalPago = l.sinal_pago || 0;
        const status = l.status_pagamento || 'pendente';

        // Ganhos totais: pagos valor total, parciais valor total
        if (status === 'pago') {
          ganhosTotais += valorTotal;
          valorBruto += valorTotal;
        } else if (status === 'parcial' || status === 'parcialmente_pago') {
          ganhosTotais += valorTotal; // Valor total nos ganhos
          valorBruto += sinalPago; // Apenas o que foi pago no valor recebido
        }
        // Pendentes não entram
      });
    } else if (tipoPeriodo === 'este_mes') {
      // Este mês: mesma lógica do mês que vem
      // Ganhos totais = faturamento total (o que vai entrar)
      // Valor recebido = o que já entrou (pagos + parciais com sinal)
      locacoesFiltradas.forEach((l: any) => {
        const valorTotal = l.valor_total || 0;
        const sinalPago = l.sinal_pago || 0;
        const status = l.status_pagamento || 'pendente';

        // Ganhos totais: valor total (o que vai entrar)
        ganhosTotais += valorTotal;

        // Valor recebido: o que já entrou
        let valorJaEntrou = 0;

        if (status === 'pago') {
          valorJaEntrou = valorTotal;
        } else if (status === 'parcial' || status === 'parcialmente_pago') {
          valorJaEntrou = sinalPago;
        }
        // Pendentes: 0

        valorBruto += valorJaEntrou;
      });
    } else {
      // Total, mês que vem, mês que vem +1, personalizado: ganhos totais = faturamento total (o que vai entrar)
      // Valor bruto = o que já entrou (pagos + parciais com sinal)
      locacoesFiltradas.forEach((l: any) => {
        const valorTotal = l.valor_total || 0;
        const sinalPago = l.sinal_pago || 0;
        const status = l.status_pagamento || 'pendente';

        // Ganhos totais: valor total (o que vai entrar)
        ganhosTotais += valorTotal;

        // Valor bruto: o que já entrou
        let valorJaEntrou = 0;

        if (status === 'pago') {
          valorJaEntrou = valorTotal;
        } else if (status === 'parcial' || status === 'parcialmente_pago') {
          valorJaEntrou = sinalPago;
        }
        // Pendentes: 0

        valorBruto += valorJaEntrou;
      });
    }

    // Total já recebido (sinais)
    const valorRecebido = locacoesFiltradas.reduce((sum: number, l: any) => sum + (l.sinal_pago || 0), 0);

    return NextResponse.json({
      locacoes: locacoesFiltradas,
      ganhosTotais,
      valorBruto,
      valorRecebido,
      quantidade: locacoesFiltradas.length,
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=15',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar ganhos futuros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ganhos futuros' },
      { status: 500 }
    );
  }
}
