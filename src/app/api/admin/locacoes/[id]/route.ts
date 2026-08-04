import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const {
      data_evento,
      horario_inicio,
      horario_fim,
      endereco,
      valor_total,
      valor_sinal,
      status_pagamento,
      status_locacao,
      cuidador_nome,
      cuidador_valor,
      observacoes,
    } = await request.json();

    // Buscar locação atual para verificar mudança de status de pagamento
    const { data: locacaoAtual } = await supabase
      .from('locacao')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!locacaoAtual) {
      return NextResponse.json({ error: 'Locação não encontrada' }, { status: 404 });
    }

    // Atualizar locação
    const { data, error } = await supabase
      .from('locacao')
      .update({
        data_evento,
        horario_inicio,
        horario_fim,
        endereco,
        valor_total,
        valor_sinal,
        status_pagamento,
        status_locacao,
        cuidador_nome,
        cuidador_valor,
        observacoes,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // Gerar transação financeira se status mudou para pago ou parcial
    if (
      (status_pagamento === 'pago' || status_pagamento === 'parcial') &&
      locacaoAtual.status_pagamento !== 'pago' &&
      locacaoAtual.status_pagamento !== 'parcial'
    ) {
      const valorTransacao = valor_total - (cuidador_valor || 0);
      
      await supabase.from('transacao_financeira').insert({
        id: crypto.randomUUID(),
        tipo: 'entrada_locacao',
        valor: valorTransacao,
        data: new Date().toISOString().split('T')[0],
        descricao: `Locação #${params.id}`,
        locacao_id: params.id,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar locação:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar locação' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Deletar itens da locação primeiro
    await supabase
      .from('locacao_item')
      .delete()
      .eq('locacao_id', params.id);

    // Deletar locação
    const { error } = await supabase
      .from('locacao')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar locação:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar locação' },
      { status: 500 }
    );
  }
}
