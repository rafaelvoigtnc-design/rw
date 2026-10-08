import { NextResponse } from 'next/server';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const docRef = doc(db, 'locacao_itens', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Item de locação não encontrado' },
        { status: 404 }
      );
    }

    await deleteDoc(docRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar item de locação:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar item de locação' },
      { status: 500 }
    );
  }
}
