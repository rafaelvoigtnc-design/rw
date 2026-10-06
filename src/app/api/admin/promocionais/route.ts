import { NextResponse } from 'next/server';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'promocionais'));
    const promocionais = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(promocionais, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar promocionais:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar promocionais' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      titulo,
      descricao,
      regras,
      fotos,
      campos_formulario,
      data_inicio,
      data_fim,
    } = body;

    if (!titulo || !descricao || !regras || !data_inicio || !data_fim) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: título, descrição, regras, data início, data fim' },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, 'promocionais'), {
      titulo,
      descricao,
      regras,
      fotos: fotos || [],
      campos_formulario: campos_formulario || [],
      data_inicio: new Date(data_inicio).toISOString(),
      data_fim: new Date(data_fim).toISOString(),
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id, ...body });
  } catch (error) {
    console.error('Erro ao criar promocional:', error);
    return NextResponse.json(
      { error: 'Erro ao criar promocional' },
      { status: 500 }
    );
  }
}
