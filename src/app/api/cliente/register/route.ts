import { NextRequest, NextResponse } from 'next/server';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { uid, nome, telefone, email, endereco, cidade } = await request.json();

    console.log('Dados de registro recebidos:', { uid, nome, telefone, email, endereco, cidade });

    // Validação
    if (!uid || !nome || !telefone || !email || !endereco || !cidade) {
      console.log('Validação falhou - campos faltando');
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Limpar telefone
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      console.log('Validação falhou - telefone inválido');
      return NextResponse.json(
        { error: 'O telefone deve ter exatamente 11 dígitos' },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe
    const existingDoc = await getDoc(doc(db, 'clientes', uid));
    if (existingDoc.exists()) {
      console.log('Usuário já existe no Firestore');
      return NextResponse.json(
        { error: 'Usuário já cadastrado' },
        { status: 400 }
      );
    }

    // Salvar dados no Firestore
    console.log('Salvando dados no Firestore...');
    await setDoc(doc(db, 'clientes', uid), {
      id: uid,
      nome,
      telefone: telefoneLimpo,
      email,
      endereco,
      cidade,
      origem_cadastro: 'site',
      criado_em: new Date().toISOString()
    });

    console.log('Registro bem-sucedido no Firestore:', email);

    return NextResponse.json(
      { success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro no registro cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
