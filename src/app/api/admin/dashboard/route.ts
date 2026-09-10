import { NextResponse } from 'next/server';
import { getDocs, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    console.log('=== DASHBOARD DEBUG ===');
    console.log('Data início:', dataInicio);
    console.log('Data fim:', dataFim);

    // Buscar todas as transações financeiras
    const transacoesSnapshot = await getDocs(collection(db, 'transacoes'));
    const transacoes = transacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Total de transações:', transacoes.length);

    // Filtrar por período se não for "todos"
    let transacoesFiltradas = transacoes;
    if (dataInicio && dataFim && dataInicio !== '2000-01-01') {
      transacoesFiltradas = transacoes.filter(t => {
        const dataTransacao = new Date(t.data);
        return dataTransacao >= new Date(dataInicio) && dataTransacao <= new Date(dataFim);
      });
      console.log('Transações filtradas:', transacoesFiltradas.length);
    }

    // Buscar todas as locações
    const locacoesSnapshot = await getDocs(collection(db, 'locacoes'));
    const locacoes = locacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Total de locações:', locacoes.length);

    // Filtrar locações por período se não for "todos"
    let locacoesFiltradas = locacoes;
    if (dataInicio && dataFim && dataInicio !== '2000-01-01') {
      locacoesFiltradas = locacoes.filter(l => {
        const dataEvento = new Date(l.data_evento);
        return dataEvento >= new Date(dataInicio) && dataEvento <= new Date(dataFim);
      });
      console.log('Locações filtradas:', locacoesFiltradas.length);
    }

    // Calcular entrada de locação a partir dos valores das locações (considerando status de pagamento)
    console.log('=== CALCULANDO ENTRADA DE LOCAÇÃO ===');
    const entradaLocacao = locacoesFiltradas.reduce((sum, l: any) => {
      const sinalPago = l.sinal_pago || 0;
      const valorTotal = l.valor_total || 0;
      const status = l.status_pagamento || 'desconhecido';

      let valorAdicionado = 0;
      if (status === 'pago') {
        valorAdicionado = valorTotal;
      } else if (status === 'parcial' || status === 'parcialmente_pago') {
        valorAdicionado = sinalPago;
      } else if (status === 'pendente') {
        valorAdicionado = 0;
      } else {
        valorAdicionado = sinalPago;
      }

      console.log(`Locação: ${l.id} | Status: ${status} | Valor Total: R$${valorTotal} | Sinal: R$${sinalPago} | Adicionado: R$${valorAdicionado}`);

      return sum + valorAdicionado;
    }, 0);
    console.log('Total entrada de locação:', entradaLocacao);

    // Transações financeiras manuais
    const injecaoCapitalBruto = transacoesFiltradas
      .filter(t => t.tipo === 'injecao_capital')
      .reduce((sum, t) => sum + (t.valor || 0), 0);
    
    const devolucaoCapital = transacoesFiltradas
      .filter(t => t.tipo === 'devolucao_capital')
      .reduce((sum, t) => sum + (t.valor || 0), 0);
    
    const injecaoCapital = injecaoCapitalBruto - devolucaoCapital;
    console.log('Injeção de capital (bruto):', injecaoCapitalBruto);
    console.log('Devolução de capital:', devolucaoCapital);
    console.log('Injeção de capital (líquido):', injecaoCapital);

    const gastos = transacoesFiltradas
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + (t.valor || 0), 0);
    console.log('Gastos:', gastos);

    const investimentos = transacoesFiltradas
      .filter((t: any) => t.tipo === 'investimento')
      .reduce((sum: number, t: any) => sum + (t.valor || 0), 0);
    console.log('Investimentos (todos):', investimentos);

    const perdas = transacoesFiltradas
      .filter((t: any) => t.tipo === 'perda')
      .reduce((sum: number, t: any) => sum + (t.valor || 0), 0);
    console.log('Perdas (todas):', perdas);

    // Total pago a cuidadores
    const totalCuidadores = locacoesFiltradas
      .reduce((sum, l) => sum + (l.cuidador_valor || 0), 0);
    console.log('Total cuidadores:', totalCuidadores);

    // Cálculo do lucro: entradas de locação - gastos - cuidadores
    // Injeções de capital não entram no lucro (são aportes, não receita operacional)
    // Investimentos não afetam o lucro (são patrimônio, não despesa operacional)
    // Perdas/roubos não afetam o lucro, apenas o patrimônio
    const lucro = entradaLocacao - gastos - totalCuidadores;
    const receitaTotal = entradaLocacao;
    const margemLucro = receitaTotal > 0 ? (lucro / receitaTotal) * 100 : 0;
    console.log('Lucro:', lucro);
    console.log('Margem de lucro:', margemLucro);

    const numeroLocacoes = locacoesFiltradas.length;
    const ticketMedio = numeroLocacoes > 0 ? entradaLocacao / numeroLocacoes : 0;
    console.log('Número de locações:', numeroLocacoes);
    console.log('Ticket médio:', ticketMedio);

    // Buscar brinquedos
    const brinquedosSnapshot = await getDocs(collection(db, 'brinquedos'));
    const brinquedos = brinquedosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const numeroBrinquedos = brinquedos.length;
    const brinquedosAtivos = brinquedos.filter(b => b.status === 'DISPONIVEL').length;
    const brinquedosIndisponiveis = brinquedos.filter(b => b.status === 'INDISPONIVEL').length;
    const brinquedosManutencao = brinquedos.filter(b => b.status === 'MANUTENCAO').length;
    const brinquedosAposentados = brinquedos.filter(b => b.status === 'APOSENTADO').length;

    console.log('Brinquedos:', numeroBrinquedos);
    console.log('Brinquedos ativos:', brinquedosAtivos);
    console.log('Brinquedos indisponíveis:', brinquedosIndisponiveis);
    console.log('Brinquedos em manutenção:', brinquedosManutencao);

    // Calcular entrada de locação a partir dos valores das locações (considerando status de pagamento)
    const todasLocacoes = locacoes.reduce((sum: number, l: any) => {
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

    const todasInjecoesBruto = transacoes
      .filter((t: any) => t.tipo === 'injecao_capital')
      .reduce((sum: number, t: any) => sum + (t.valor || 0), 0);

    const todasDevolucoes = transacoes
      .filter((t: any) => t.tipo === 'devolucao_capital')
      .reduce((sum: number, t: any) => sum + (t.valor || 0), 0);

    const todasInjecoes = todasInjecoesBruto - todasDevolucoes;

    const todosGastos = transacoes
      .filter((t: any) => t.tipo === 'gasto')
      .reduce((sum: number, t: any) => sum + (t.valor || 0), 0);

    const todosInvestimentos = transacoes
      .filter((t: any) => t.tipo === 'investimento')
      .reduce((sum: number, t: any) => sum + (t.valor || 0), 0);

    const todasPerdas = transacoes
      .filter((t: any) => t.tipo === 'perda')
      .reduce((sum: number, t: any) => sum + (t.valor || 0), 0);

    // Patrimônio: Investimentos (todos) - Perdas (todas)
    const patrimonio = todosInvestimentos - todasPerdas;
    console.log('Patrimônio:', patrimonio);

    // Saldo em caixa: Injeções (líquido) + Locações - Gastos - Investimentos
    // Nota: Devoluções já estão descontadas das injeções líquidas
    const saldoEmCaixa = todasInjecoes + todasLocacoes - todosGastos - todosInvestimentos;
    console.log('Saldo em caixa:', saldoEmCaixa);

    // Dados para gráfico de evolução mensal (últimos 12 meses)
    const dadosGrafico = [];
    const hoje = new Date();

    for (let i = 11; i >= 0; i--) {
      const dataMes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0);

      const mesStr = dataMes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      // Entradas de locação do mês
      const entradasMes = locacoes
        .filter(l => {
          const dataEvento = new Date(l.data_evento);
          return dataEvento >= dataMes && dataEvento <= proximoMes;
        })
        .reduce((sum, l) => sum + (l.valor_total || 0), 0);

      // Gastos do mês (apenas gastos, sem investimentos e perdas)
      const gastosMes = transacoes
        .filter(t => {
          const dataTransacao = new Date(t.data);
          return t.tipo === 'gasto' &&
                 dataTransacao >= dataMes &&
                 dataTransacao <= proximoMes;
        })
        .reduce((sum, t) => sum + (t.valor || 0), 0);

      dadosGrafico.push({
        mes: mesStr,
        entradas: entradasMes,
        gastos: gastosMes,
      });
    }

    return NextResponse.json({
      entradaLocacao,
      injecaoCapital, // Valor bruto das injeções
      devolucaoCapital, // Devoluções separadas
      gastos,
      investimentos,
      perdas,
      lucro,
      margemLucro,
      totalCuidadores,
      numeroLocacoes,
      numeroBrinquedos,
      brinquedosAtivos,
      brinquedosIndisponiveis,
      brinquedosManutencao,
      brinquedosAposentados,
      ticketMedio,
      saldoEmCaixa,
      dadosGrafico,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 }
    );
  }
}
