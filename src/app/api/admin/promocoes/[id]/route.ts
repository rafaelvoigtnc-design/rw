import { NextResponse } from 'next/server';
import { updatePromocao, deletePromocao } from '@/lib/firebase-db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { titulo, descricao, data_inicio, data_fim, ativa } = await request.json();

    await updatePromocao(id, {
      titulo,
      descricao,
      data_inicio,
      data_fim,
      ativa,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar promoção:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar promoção' },
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

    await deletePromocao(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar promoção:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar promoção' },
      { status: 500 }
    );
  }
}
