import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const docRef = doc(db, 'contratos', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar contrato' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const docRef = doc(db, 'contratos', id);
    await updateDoc(docRef, {
      ...body,
      atualizado_em: new Date().toISOString(),
    });

    return NextResponse.json({ id, ...body });
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar contrato' },
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

    const docRef = doc(db, 'contratos', id);
    await deleteDoc(docRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir contrato' },
      { status: 500 }
    );
  }
}
