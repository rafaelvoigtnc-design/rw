import { NextResponse } from 'next/server';
import { getDocs, collection, query, where, orderBy, addDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const q = query(collection(db, 'transacoes'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Ordenar por data no cliente
    data.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar transações financeiras:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar transações financeiras' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { tipo, valor, data, descricao, categoria, origem } = await request.json();

    const docRef = await addDoc(collection(db, 'transacoes'), {
      tipo,
      valor,
      data,
      descricao: descricao || '',
      categoria: categoria || null,
      origem: origem || 'caixa_empresa',
      criado_em: new Date().toISOString(),
    });

    const docSnap = await getDoc(docRef);
    return NextResponse.json({ id: docRef.id, ...docSnap.data() });
  } catch (error) {
    console.error('Erro ao criar transação financeira:', error);
    return NextResponse.json(
      { error: 'Erro ao criar transação financeira' },
      { status: 500 }
    );
  }
}
