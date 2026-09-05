import { NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const docRef = doc(db, 'avaliacoes', id);
    await updateDoc(docRef, {
      aprovado_para_exibir: body.aprovado,
      atualizado_em: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar avaliação' },
      { status: 500 }
    );
  }
}
