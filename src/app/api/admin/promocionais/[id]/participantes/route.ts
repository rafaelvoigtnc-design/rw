import { NextResponse } from 'next/server';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const q = query(
      collection(db, 'participacoes_promocional'),
      where('promocional_id', '==', params.id)
    );
    const snapshot = await getDocs(q);
    const participantes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(participantes);
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar participantes' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { participanteId, dados_participacao } = body;

    if (!participanteId) {
      return NextResponse.json(
        { error: 'ID do participante é obrigatório' },
        { status: 400 }
      );
    }

    const docRef = doc(db, 'participacoes_promocional', participanteId);
    await updateDoc(docRef, { dados_participacao });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar participante:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar participante' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const participanteId = searchParams.get('participanteId');

    if (!participanteId) {
      return NextResponse.json(
        { error: 'ID do participante é obrigatório' },
        { status: 400 }
      );
    }

    const docRef = doc(db, 'participacoes_promocional', participanteId);
    await deleteDoc(docRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir participante:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir participante' },
      { status: 500 }
    );
  }
}
