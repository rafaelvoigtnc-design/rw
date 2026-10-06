import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'promocionais', params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Promocional não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('Erro ao buscar promocional:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar promocional' },
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
    const {
      titulo,
      descricao,
      regras,
      fotos,
      campos_formulario,
      data_inicio,
      data_fim,
      ativo,
    } = body;

    const docRef = doc(db, 'promocionais', params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Promocional não encontrado' },
        { status: 404 }
      );
    }

    const updateData: any = {
      atualizado_em: new Date().toISOString(),
    };

    if (titulo !== undefined) updateData.titulo = titulo;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (regras !== undefined) updateData.regras = regras;
    if (fotos !== undefined) updateData.fotos = fotos;
    if (campos_formulario !== undefined) updateData.campos_formulario = campos_formulario;
    if (data_inicio !== undefined) updateData.data_inicio = new Date(data_inicio).toISOString();
    if (data_fim !== undefined) {
      updateData.data_fim = new Date(data_fim).toISOString();
      // Se data fim estiver no futuro, ativa automaticamente
      const fim = new Date(data_fim);
      if (fim >= new Date()) {
        updateData.ativo = true;
      }
    }
    if (ativo !== undefined) updateData.ativo = ativo;

    await updateDoc(docRef, updateData);

    return NextResponse.json({ id: params.id, ...updateData });
  } catch (error) {
    console.error('Erro ao atualizar promocional:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar promocional' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'promocionais', params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Promocional não encontrado' },
        { status: 404 }
      );
    }

    await deleteDoc(docRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir promocional:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir promocional' },
      { status: 500 }
    );
  }
}
