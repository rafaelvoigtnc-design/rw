import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Obter token do header de autorização ou cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('firebase_token')?.value;
    
    if (!token) {
      console.log('Token não fornecido');
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Decodificar o token (basic verification - format check)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Token inválido: formato incorreto');
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      // Decodificar o payload (sem verificação de assinatura por enquanto)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const uid = payload.user_id || payload.uid;
      
      if (!uid) {
        console.log('Token não contém UID');
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      console.log('UID do token:', uid);

      // Buscar dados do cliente no Firestore
      const docRef = doc(db, 'clientes', uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
      }

      const cliente = { id: docSnap.id, ...docSnap.data() };
      console.log('Cliente encontrado:', cliente.nome);

      return NextResponse.json(cliente);
    } catch (decodeError) {
      console.error('Erro ao decodificar token:', decodeError);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Obter token do header de autorização ou cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('firebase_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Decodificar o token
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

      const body = await request.json();
      const { nome, telefone, email, senha, endereco, cidade } = body;

      // Validar telefone
      const telefoneLimpo = telefone.replace(/\D/g, '');
      if (telefoneLimpo.length !== 11) {
        return NextResponse.json({ error: 'O telefone deve ter exatamente 11 dígitos' }, { status: 400 });
      }

      // Preparar dados para atualizar
      const updateData: any = {
        nome,
        telefone: telefoneLimpo,
        email,
        endereco,
        cidade,
      };

      // Atualizar dados no Firestore
      const docRef = doc(db, 'clientes', uid);
      await updateDoc(docRef, updateData);

      return NextResponse.json({ success: true });
    } catch (decodeError) {
      console.error('Erro ao decodificar token:', decodeError);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
