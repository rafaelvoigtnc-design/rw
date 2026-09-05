import { NextResponse } from 'next/server';
import { getAllPromocoes, createPromocao, updatePromocao, deletePromocao } from '@/lib/firebase-db';

export async function GET() {
  try {
    const promocoes = await getAllPromocoes();
    return NextResponse.json(promocoes);
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar promoções' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { titulo, descricao, data_inicio, data_fim, ativa } = await request.json();

    const data = await createPromocao({
      titulo,
      descricao,
      data_inicio,
      data_fim,
      ativa: ativa || false,
    });

    return NextResponse.json({ id: data.id, titulo, descricao, data_inicio, data_fim, ativa });
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    return NextResponse.json(
      { error: 'Erro ao criar promoção' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, titulo, descricao, data_inicio, data_fim, ativa } = await request.json();

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

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

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
