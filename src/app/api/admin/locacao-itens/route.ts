import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { locacao_id, brinquedo_id, brinquedo_nome } = body;

    if (!locacao_id || !brinquedo_id) {
      return NextResponse.json(
        { error: 'locacao_id e brinquedo_id são obrigatórios' },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, 'locacao_itens'), {
      locacao_id,
      brinquedo_id,
      brinquedo_nome: brinquedo_nome || '',
      criado_em: new Date().toISOString()
    });

    return NextResponse.json({ id: docRef.id, locacao_id, brinquedo_id, brinquedo_nome });
  } catch (error) {
    console.error('Erro ao criar item de locação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar item de locação' },
      { status: 500 }
    );
  }
}
