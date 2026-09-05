import { NextResponse } from 'next/server';
import { getLocacaoById, updateLocacao, deleteLocacao, getLocacaoItens, deleteLocacaoItens } from '@/lib/firebase-db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      data_evento,
      horario_inicio,
      horario_fim,
      endereco,
      local_evento,
      status_pagamento,
      status_locacao,
      valor_total,
      sinal_pago,
      cuidador_nome,
      cuidador_valor,
      observacoes
    } = body;

    console.log('Atualizando locação ID:', id, 'com dados:', body);

    // Verificar se a locação existe
    const locacaoExistente = await getLocacaoById(id);
    if (!locacaoExistente) {
      console.log('Locação não encontrada:', id);
      return NextResponse.json(
        { error: 'Locação não encontrada' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (data_evento !== undefined) updateData.data_evento = data_evento;
    if (horario_inicio !== undefined) updateData.horario_inicio = horario_inicio;
    if (horario_fim !== undefined) updateData.horario_fim = horario_fim;
    if (endereco !== undefined) updateData.endereco = endereco;
    if (local_evento !== undefined) updateData.local_evento = local_evento;
    if (status_pagamento !== undefined) updateData.status_pagamento = status_pagamento;
    if (status_locacao !== undefined) updateData.status_locacao = status_locacao;
    if (valor_total !== undefined) updateData.valor_total = valor_total;
    if (sinal_pago !== undefined) updateData.sinal_pago = sinal_pago;
    if (cuidador_nome !== undefined) updateData.cuidador_nome = cuidador_nome;
    if (cuidador_valor !== undefined) updateData.cuidador_valor = cuidador_valor;
    if (observacoes !== undefined) updateData.observacoes = observacoes;

    console.log('Dados de atualização:', updateData);
    
    const result = await updateLocacao(id, updateData);

    console.log('Locação atualizada com sucesso:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar locação:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar locação', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Deletando locação ID:', id);

    // Verificar se a locação existe
    const locacaoExistente = await getLocacaoById(id);
    if (!locacaoExistente) {
      console.log('Locação não encontrada:', id);
      return NextResponse.json(
        { error: 'Locação não encontrada' },
        { status: 404 }
      );
    }

    // Primeiro deletar os itens da locação
    await deleteLocacaoItens(id);

    // Depois deletar a locação
    await deleteLocacao(id);

    console.log('Locação deletada com sucesso');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar locação:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar locação', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
