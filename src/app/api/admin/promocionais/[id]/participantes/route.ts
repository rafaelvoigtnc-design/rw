import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
