import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Obter token do header de autorização
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Decodificar o token para obter UID
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const uid = payload.user_id || payload.uid;
      
      if (!uid) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      // Verificar se o item pertence ao usuário
      const itemDoc = await getDoc(doc(db, 'carrinho', id));
      if (!itemDoc.exists()) {
        return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
      }

      const itemData = itemDoc.data();
      if (itemData.cliente_id !== uid) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }

      // Deletar o item
      await deleteDoc(doc(db, 'carrinho', id));

      return NextResponse.json({ success: true });
    } catch (decodeError) {
      console.error('Erro ao decodificar token:', decodeError);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  } catch (error) {
    console.error('Erro ao remover item:', error);
    return NextResponse.json(
      { error: 'Erro ao remover item' },
      { status: 500 }
    );
  }
}