import { NextResponse } from 'next/server';
import { getDocs, collection, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Buscar contrato específico
      const docRef = doc(db, 'contratos', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return NextResponse.json({ id, ...docSnap.data() });
      } else {
        return NextResponse.json(
          { error: 'Contrato não encontrado' },
          { status: 404 }
        );
      }
    } else {
      // Buscar todos os contratos
      const snapshot = await getDocs(collection(db, 'contratos'));
      const contratos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json(contratos);
    }
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar contratos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const docRef = await addDoc(collection(db, 'contratos'), {
      ...body,
      data_contrato: new Date().toISOString(),
      status: 'RASCUNHO',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    });

    const docSnap = await getDoc(docRef);
    const data = { id: docRef.id, ...docSnap.data() };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao criar contrato' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const body = await request.json();
    const docRef = doc(db, 'contratos', id);

    await updateDoc(docRef, {
      ...body,
      atualizado_em: new Date().toISOString(),
    });

    const docSnap = await getDoc(docRef);
    const data = { id, ...docSnap.data() };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar contrato' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const docRef = doc(db, 'contratos', id);
    await deleteDoc(docRef);

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Erro ao excluir contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir contrato' },
      { status: 500 }
    );
  }
}
