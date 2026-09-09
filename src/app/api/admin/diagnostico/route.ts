import { NextResponse } from 'next/server';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    console.log('🔍 [DIAGNÓSTICO] Iniciando análise financeira completa...');

    // Buscar todas as locações
    const locacoesSnapshot = await getDocs(collection(db, 'locacoes'));
    const locacoes = locacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Buscar todas as transações financeiras
    const transacoesSnapshot = await getDocs(collection(db, 'transacoes'));
    const transacoes = transacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Análise detalhada das locações por status
    const locacoesPorStatus = {
      pago: locacoes.filter(l => l.status_pagamento === 'pago'),
      parcial: locacoes.filter(l => l.status_pagamento === 'parcial' || l.status_pagamento === 'parcialmente_pago'),
      pendente: locacoes.filter(l => l.status_pagamento === 'pendente'),
      outros: locacoes.filter(l => !['pago', 'parcial', 'parcialmente_pago', 'pendente'].includes(l.status_pagamento))
    };

    // Calcular valores por status
    const valorLocacoesPago = locacoesPorStatus.pago.reduce((sum, l) => sum + (l.valor_total || 0), 0);
    const valorLocacoesParcial = locacoesPorStatus.parcial.reduce((sum, l) => sum + (l.sinal_pago || 0), 0);
    const valorLocacoesPendente = locacoesPorStatus.pendente.reduce((sum, l) => sum + (l.sinal_pago || 0), 0);
    const valorLocacoesOutros = locacoesPorStatus.outros.reduce((sum, l) => sum + (l.sinal_pago || 0), 0);

    // Análise detalhada das transações por tipo
    const transacoesPorTipo = {
      injecao_capital: transacoes.filter(t => t.tipo === 'injecao_capital'),
      devolucao_capital: transacoes.filter(t => t.tipo === 'devolucao_capital'),
      gasto: transacoes.filter(t => t.tipo === 'gasto'),
      investimento: transacoes.filter(t => t.tipo === 'investimento'),
      perda: transacoes.filter(t => t.tipo === 'perda'),
      entrada_locacao: transacoes.filter(t => t.tipo === 'entrada_locacao' || t.tipo === 'ENTRADA_LOCACAO'),
      outros: transacoes.filter(t => !['injecao_capital', 'devolucao_capital', 'gasto', 'investimento', 'perda', 'entrada_locacao', 'ENTRADA_LOCACAO'].includes(t.tipo))
    };

    // Calcular valores por tipo
    const valorInjecaoCapital = transacoesPorTipo.injecao_capital.reduce((sum, t) => sum + (t.valor || 0), 0);
    const valorDevolucaoCapitalCaixa = transacoesPorTipo.devolucao_capital.filter(t => t.origem === 'caixa_empresa').reduce((sum, t) => sum + (t.valor || 0), 0);
    const valorDevolucaoCapitalExterno = transacoesPorTipo.devolucao_capital.filter(t => t.origem === 'capital_externo').reduce((sum, t) => sum + (t.valor || 0), 0);
    const valorGastos = transacoesPorTipo.gasto.reduce((sum, t) => sum + (t.valor || 0), 0);
    const valorInvestimentos = transacoesPorTipo.investimento.reduce((sum, t) => sum + (t.valor || 0), 0);
    const valorPerdas = transacoesPorTipo.perda.reduce((sum, t) => sum + (t.valor || 0), 0);
    const valorEntradaLocacao = transacoesPorTipo.entrada_locacao.reduce((sum, t) => sum + (t.valor || 0), 0);

    // Investimentos por origem
    const investimentosCaixa = transacoesPorTipo.investimento.filter(t => t.origem === 'caixa_empresa').reduce((sum, t) => sum + (t.valor || 0), 0);
    const investimentosExterno = transacoesPorTipo.investimento.filter(t => t.origem === 'capital_externo').reduce((sum, t) => sum + (t.valor || 0), 0);

    // Cálculo atual do sistema (com injeções brutas e devoluções separadas)
    const totalLocacoesAtual = valorLocacoesPago + valorLocacoesParcial + valorLocacoesPendente + valorLocacoesOutros;
    const saldoAtualSistema = valorInjecaoCapital + totalLocacoesAtual - valorGastos - valorInvestimentos - valorDevolucaoCapitalCaixa - valorDevolucaoCapitalExterno;

    // Análise de possíveis problemas
    const problemas = [];

    // Verificar se há transações de entrada_locacao manuais e comparar com locações
    if (transacoesPorTipo.entrada_locacao.length > 0) {
      // Verificar se essas transações correspondem a locações existentes
      const transacoesComLocacaoId = transacoesPorTipo.entrada_locacao.filter(t => t.locacao_id);
      const transacoesSemLocacaoId = transacoesPorTipo.entrada_locacao.filter(t => !t.locacao_id);

      problemas.push({
        tipo: 'ANALISE_TRANSACOES_MANUAIS',
        descricao: `Existem ${transacoesPorTipo.entrada_locacao.length} transações manuais de "Entrada de Locação" no valor total de R$${valorEntradaLocacao.toFixed(2)}. Destas, ${transacoesComLocacaoId.length} têm locacao_id e ${transacoesSemLocacaoId.length} não têm locacao_id.`,
        detalhes: {
          com_locacao_id: transacoesComLocacaoId.length,
          sem_locacao_id: transacoesSemLocacaoId.length,
          valor_total: valorEntradaLocacao
        }
      });
    }

    // Verificar se há investimentos com capital externo que estão sendo descontados
    if (investimentosExterno > 0) {
      problemas.push({
        tipo: 'INVESTIMENTO_EXTERNO_DESCONTADO',
        descricao: `Existem investimentos com capital externo no valor de R$${investimentosExterno.toFixed(2)} que estão sendo descontados do caixa atual.`,
        impacto: investimentosExterno
      });
    }

    // Verificar se há muitas locações pendentes com sinal pago
    const locacoesPendentesComSinal = locacoesPorStatus.pendente.filter(l => (l.sinal_pago || 0) > 0);
    if (locacoesPendentesComSinal.length > 0) {
      const totalSinalPendente = locacoesPendentesComSinal.reduce((sum, l) => sum + (l.sinal_pago || 0), 0);
      problemas.push({
        tipo: 'LOCACOES_PENDENTES_COM_SINAL',
        descricao: `Existem ${locacoesPendentesComSinal.length} locações pendentes com sinal pago total de R$${totalSinalPendente.toFixed(2)}. Verifique se esses valores realmente deveriam ser contados.`,
        impacto: totalSinalPendente
      });
    }

    // Calcular saldo sem considerar investimentos externos
    const saldoSemInvestimentosExternos = valorInjecaoCapital + totalLocacoesAtual - valorGastos - investimentosCaixa - valorDevolucaoCapitalCaixa;

    const diagnostico = {
      resumo: {
        totalLocacoes: locacoes.length,
        totalTransacoes: transacoes.length,
        saldoAtualSistema: saldoAtualSistema,
        saldoEsperadoUsuario: 450, // Valor informado pelo usuário
        diferenca: saldoAtualSistema - 450
      },
      locacoes: {
        total: locacoes.length,
        porStatus: {
          pago: { quantidade: locacoesPorStatus.pago.length, valor: valorLocacoesPago },
          parcial: { quantidade: locacoesPorStatus.parcial.length, valor: valorLocacoesParcial },
          pendente: { quantidade: locacoesPorStatus.pendente.length, valor: valorLocacoesPendente },
          outros: { quantidade: locacoesPorStatus.outros.length, valor: valorLocacoesOutros }
        },
        totalCalculado: totalLocacoesAtual
      },
      transacoes: {
        total: transacoes.length,
        porTipo: {
          injecao_capital: { quantidade: transacoesPorTipo.injecao_capital.length, valor: valorInjecaoCapital },
          devolucao_capital_caixa: { quantidade: transacoesPorTipo.devolucao_capital.filter(t => t.origem === 'caixa_empresa').length, valor: valorDevolucaoCapitalCaixa },
          devolucao_capital_externo: { quantidade: transacoesPorTipo.devolucao_capital.filter(t => t.origem === 'capital_externo').length, valor: valorDevolucaoCapitalExterno },
          gasto: { quantidade: transacoesPorTipo.gasto.length, valor: valorGastos },
          investimento_caixa: { quantidade: transacoesPorTipo.investimento.filter(t => t.origem === 'caixa_empresa').length, valor: investimentosCaixa },
          investimento_externo: { quantidade: transacoesPorTipo.investimento.filter(t => t.origem === 'capital_externo').length, valor: investimentosExterno },
          perda: { quantidade: transacoesPorTipo.perda.length, valor: valorPerdas },
          entrada_locacao: { quantidade: transacoesPorTipo.entrada_locacao.length, valor: valorEntradaLocacao }
        }
      },
      calculoSistema: {
        formula: 'Injeções + Locações - Gastos - Investimentos - Devoluções (caixa)',
        valores: {
          injecoes: valorInjecaoCapital,
          locacoes: totalLocacoesAtual,
          gastos: valorGastos,
          investimentos: valorInvestimentos,
          devolucoes_caixa: valorDevolucaoCapitalCaixa
        },
        resultado: saldoAtualSistema
      },
      calculoAjustado: {
        formula: 'Injeções + Locações - Gastos - Investimentos (apenas caixa) - Devoluções (caixa)',
        valores: {
          injecoes: valorInjecaoCapital,
          locacoes: totalLocacoesAtual,
          gastos: valorGastos,
          investimentos_caixa: investimentosCaixa,
          devolucoes_caixa: valorDevolucaoCapitalCaixa
        },
        resultado: saldoSemInvestimentosExternos
      },
      problemas,
      detalhesLocacoesPendentes: locacoesPendentesComSinal.map(l => ({
        id: l.id,
        cliente: l.cliente_nome || 'Não informado',
        valor_total: l.valor_total,
        sinal_pago: l.sinal_pago,
        data_evento: l.data_evento
      })),
      detalhesTransacoesEntradaLocacao: transacoesPorTipo.entrada_locacao.map(t => ({
        id: t.id,
        valor: t.valor,
        descricao: t.descricao,
        data: t.data
      }))
    };

    console.log('🔍 [DIAGNÓSTICO] Análise concluída:', JSON.stringify(diagnostico, null, 2));

    return NextResponse.json(diagnostico);
  } catch (error) {
    console.error('❌ [DIAGNÓSTICO] Erro ao realizar diagnóstico:', error);
    return NextResponse.json(
      { error: 'Erro ao realizar diagnóstico financeiro' },
      { status: 500 }
    );
  }
}