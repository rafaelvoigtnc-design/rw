import { NextResponse } from 'next/server';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { tipo, valor, data, descricao, categoria, origem } = await request.json();

    const docRef = doc(db, 'transacoes', id);
    await updateDoc(docRef, {
      tipo,
      valor,
      data,
      descricao: descricao || '',
      categoria: categoria || null,
      origem: origem || 'caixa_empresa',
      atualizado_em: new Date().toISOString(),
    });

    return NextResponse.json({ id, tipo, valor, data, descricao, categoria, origem });
  } catch (error) {
    console.error('Erro ao atualizar transação financeira:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar transação financeira' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const docRef = doc(db, 'transacoes', id);
    await deleteDoc(docRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir transação financeira:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir transação financeira' },
      { status: 500 }
    );
  }
}
