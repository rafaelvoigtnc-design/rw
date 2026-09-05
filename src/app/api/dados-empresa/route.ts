import { NextResponse } from 'next/server';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  try {
    const q = query(collection(db, 'dados_empresa'), where('id', '==', 'empresa_01'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(null);
    }

    return NextResponse.json({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
  } catch (error) {
    console.error('Erro ao buscar dados da empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados da empresa' },
      { status: 500 }
    );
  }
}
