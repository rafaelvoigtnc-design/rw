import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { telefone } = await request.json();

    console.log('Login por telefone recebido:', telefone);

    // Validação
    if (!telefone) {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    // Limpar telefone
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      return NextResponse.json(
        { error: 'O telefone deve ter exatamente 11 dígitos' },
        { status: 400 }
      );
    }

    // Buscar cliente pelo telefone
    const clientesRef = collection(db, 'clientes');
    const q = query(clientesRef, where('telefone', '==', telefoneLimpo));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('Nenhum cliente encontrado com telefone:', telefoneLimpo);
      return NextResponse.json(
        { error: 'Telefone não encontrado. Verifique ou entre com email.' },
        { status: 404 }
      );
    }

    // Pegar o primeiro resultado (telefone deve ser único)
    const clienteDoc = querySnapshot.docs[0];
    const clienteData = clienteDoc.data();

    console.log('Cliente encontrado:', clienteData.email);

    // Retornar o email para fazer login
    return NextResponse.json(
      {
        success: true,
        email: clienteData.email,
        nome: clienteData.nome
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no login por telefone:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
