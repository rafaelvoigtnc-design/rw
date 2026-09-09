import { NextResponse } from 'next/server';
import { doc, updateDoc, deleteDoc, getDocs, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const docRef = doc(db, 'banners', id);
    await updateDoc(docRef, {
      ...body,
      atualizado_em: new Date().toISOString(),
    });

    return NextResponse.json({ id, ...body });
  } catch (error) {
    console.error('Erro ao atualizar banner:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar banner' },
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

    const docRef = doc(db, 'banners', id);
    await deleteDoc(docRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir banner:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir banner' },
      { status: 500 }
    );
  }
}
