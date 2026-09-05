import { NextResponse } from 'next/server';
import { getDocs, collection, query, where, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pagina = searchParams.get('pagina');
    const chave = searchParams.get('chave');

    let q = collection(db, 'conteudo_pagina');

    if (pagina) {
      q = query(q, where('pagina', '==', pagina));
    }

    if (chave) {
      q = query(q, where('chave', '==', chave));
    }

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Se buscar por chave específica, retorna apenas o valor
    if (chave && data.length > 0) {
      return NextResponse.json(data[0]);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar conteúdo' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pagina, chave, valor, tipo } = body;

    // Verificar se já existe um conteúdo com a mesma página e chave
    const q = query(
      collection(db, 'conteudo_pagina'),
      where('pagina', '==', pagina),
      where('chave', '==', chave)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Atualizar existente
      const docRef = doc(db, 'conteudo_pagina', snapshot.docs[0].id);
      await updateDoc(docRef, {
        valor,
        tipo,
        atualizado_em: new Date().toISOString(),
      });
      const docSnap = await getDoc(docRef);
      return NextResponse.json({ id: docRef.id, ...docSnap.data() });
    } else {
      // Criar novo
      const docRef = await addDoc(collection(db, 'conteudo_pagina'), {
        pagina,
        chave,
        valor,
        tipo,
        atualizado_em: new Date().toISOString(),
      });
      const docSnap = await getDoc(docRef);
      return NextResponse.json({ id: docRef.id, ...docSnap.data() });
    }
  } catch (error) {
    console.error('Erro ao salvar conteúdo:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar conteúdo' },
      { status: 500 }
    );
  }
}
