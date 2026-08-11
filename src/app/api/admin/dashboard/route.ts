import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    // Filtrar transações por período
    let transacoesQuery = supabaseAdmin.from('transacao_financeira').select('*');

    if (dataInicio && dataFim) {
      transacoesQuery = transacoesQuery.gte('data', dataInicio).lte('data', dataFim);
    }

    const { data: transacoes, error: transacoesError } = await transacoesQuery;

    if (transacoesError) throw transacoesError;

    // Filtrar locações por período para cálculos adicionais
    let locacoesQuery = supabaseAdmin.from('locacao').select('*');

    if (dataInicio && dataFim) {
      locacoesQuery = locacoesQuery.gte('data_evento', dataInicio).lte('data_evento', dataFim);
    }

    const { data: locacoes, error: locacoesError } = await locacoesQuery;

    if (locacoesError) throw locacoesError;

    // Cálculos
    const entradaLocacao = transacoes
      .filter(t => t.tipo === 'entrada_locacao')
      .reduce((sum, t) => sum + t.valor, 0);

    const injecaoCapital = transacoes
      .filter(t => t.tipo === 'injecao_capital')
      .reduce((sum, t) => sum + t.valor, 0);

    const gastos = transacoes
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.valor, 0);

    const investimentos = transacoes
      .filter(t => t.tipo === 'investimento')
      .reduce((sum, t) => sum + t.valor, 0);

    const lucro = entradaLocacao - gastos - investimentos;
    const margemLucro = entradaLocacao > 0 ? (lucro / entradaLocacao) * 100 : 0;

    const totalCuidadores = (locacoes || [])
      .reduce((sum, l) => sum + (l.cuidador_valor || 0), 0);

    const numeroLocacoes = (locacoes || []).length;
    const ticketMedio = numeroLocacoes > 0 ? entradaLocacao / numeroLocacoes : 0;

    // Contar número de brinquedos
    const { data: brinquedos, error: brinquedosError } = await supabaseAdmin
      .from('brinquedo')
      .select('id, status');

    console.log('Brinquedos:', brinquedos);
    console.log('Erro brinquedos:', brinquedosError);

    const numeroBrinquedos = brinquedos?.length || 0;
    const brinquedosAtivos = brinquedos?.filter(b => b.status === 'DISPONIVEL').length || 0;

    // Dados para gráfico de evolução mensal (últimos 12 meses)
    const dadosGrafico = [];
    const hoje = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const dataMes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 1);
      
      const mesStr = dataMes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      const entradasMes = transacoes
        .filter(t => {
          const dataTransacao = new Date(t.data);
          return t.tipo === 'entrada_locacao' &&
                 dataTransacao >= dataMes &&
                 dataTransacao < proximoMes;
        })
        .reduce((sum, t) => sum + t.valor, 0);

      const gastosMes = transacoes
        .filter(t => {
          const dataTransacao = new Date(t.data);
          return (t.tipo === 'gasto' || t.tipo === 'investimento') &&
                 dataTransacao >= dataMes &&
                 dataTransacao < proximoMes;
        })
        .reduce((sum, t) => sum + t.valor, 0);

      dadosGrafico.push({
        mes: mesStr,
        entradas: entradasMes,
        gastos: gastosMes,
      });
    }

    // Comparativo com período anterior
    let comparativo = null;
    if (dataInicio && dataFim) {
      const inicioAtual = new Date(dataInicio);
      const fimAtual = new Date(dataFim);
      const diasPeriodo = (fimAtual.getTime() - inicioAtual.getTime()) / (1000 * 60 * 60 * 24);
      
      const inicioAnterior = new Date(inicioAtual.getTime() - diasPeriodo * 24 * 60 * 60 * 1000);
      
      const { data: transacoesAnterior } = await supabaseAdmin
        .from('transacao_financeira')
        .select('*')
        .gte('data', inicioAnterior.toISOString().split('T')[0])
        .lte('data', inicioAtual.toISOString().split('T')[0]);

      if (transacoesAnterior) {
        const entradaAnterior = transacoesAnterior
          .filter(t => t.tipo === 'entrada_locacao')
          .reduce((sum, t) => sum + t.valor, 0);

        const variacao = entradaAnterior > 0 
          ? ((entradaLocacao - entradaAnterior) / entradaAnterior) * 100 
          : 0;

        comparativo = {
          periodoAnterior: entradaAnterior,
          periodoAtual: entradaLocacao,
          variacao,
        };
      }
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
