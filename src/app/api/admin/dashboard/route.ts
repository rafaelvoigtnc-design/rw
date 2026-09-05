import { NextResponse } from 'next/server';
import { getDocs, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    console.log('Buscando dados do dashboard...');
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

    // Calcular entrada de locação a partir dos valores das locações
    const entradaLocacao = locacoesFiltradas
      .reduce((sum, l) => sum + (l.valor_total || 0), 0);
    console.log('Entrada de locação:', entradaLocacao);

    // Transações financeiras manuais
    const injecaoCapital = transacoesFiltradas
      .filter(t => t.tipo === 'injecao_capital')
      .reduce((sum, t) => sum + (t.valor || 0), 0);
    console.log('Injeção de capital:', injecaoCapital);

    const gastos = transacoesFiltradas
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + (t.valor || 0), 0);
    console.log('Gastos:', gastos);

    const investimentos = transacoesFiltradas
      .filter(t => t.tipo === 'investimento')
      .reduce((sum, t) => sum + (t.valor || 0), 0);
    console.log('Investimentos:', investimentos);

    // Total pago a cuidadores
    const totalCuidadores = locacoesFiltradas
      .reduce((sum, l) => sum + (l.cuidador_valor || 0), 0);
    console.log('Total cuidadores:', totalCuidadores);

    // Cálculo do lucro: entradas de locação + injeção de capital - gastos - investimentos - cuidadores
    const lucro = entradaLocacao + injecaoCapital - gastos - investimentos - totalCuidadores;
    const receitaTotal = entradaLocacao + injecaoCapital;
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

    console.log('Brinquedos:', numeroBrinquedos);
    console.log('Brinquedos ativos:', brinquedosAtivos);
    console.log('Brinquedos indisponíveis:', brinquedosIndisponiveis);
    console.log('Brinquedos em manutenção:', brinquedosManutencao);

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

      // Gastos do mês
      const gastosMes = transacoes
        .filter(t => {
          const dataTransacao = new Date(t.data);
          return (t.tipo === 'gasto' || t.tipo === 'investimento') &&
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

    // Comparativo com período anterior
    let comparativo = null;
    if (dataInicio && dataFim && dataInicio !== '2000-01-01') {
      const inicioAtual = new Date(dataInicio);
      const fimAtual = new Date(dataFim);
      const diasPeriodo = (fimAtual.getTime() - inicioAtual.getTime()) / (1000 * 60 * 60 * 24);

      const inicioAnterior = new Date(inicioAtual.getTime() - diasPeriodo * 24 * 60 * 60 * 1000);
      const fimAnterior = new Date(inicioAtual.getTime() - 1);

      const locacoesAnterior = locacoes.filter(l => {
        const dataEvento = new Date(l.data_evento);
        return dataEvento >= inicioAnterior && dataEvento <= fimAnterior;
      });

      const entradaAnterior = locacoesAnterior
        .reduce((sum, l) => sum + (l.valor_total || 0), 0);

      const variacao = entradaAnterior > 0
        ? ((entradaLocacao - entradaAnterior) / entradaAnterior) * 100
        : 0;

      comparativo = {
        periodoAnterior: entradaAnterior,
        periodoAtual: entradaLocacao,
        variacao,
      };
    }

    return NextResponse.json({
      entradaLocacao,
      injecaoCapital,
      gastos,
      investimentos,
      lucro,
      margemLucro,
      totalCuidadores,
      numeroLocacoes,
      numeroBrinquedos,
      brinquedosAtivos,
      brinquedosIndisponiveis,
      brinquedosManutencao,
      ticketMedio,
      dadosGrafico,
      comparativo,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 }
    );
  }
}
