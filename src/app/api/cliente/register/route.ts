import { NextRequest, NextResponse } from 'next/server';
import { getClientByEmail, createClientRecord } from '@/lib/supabase';
import { hashPassword, createClientToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { nome, telefone, email, senha, endereco } = await request.json();

    // Validação
    if (!nome || !telefone || !email || !senha || !endereco) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingClient = await getClientByEmail(email);
    if (existingClient) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Hash da senha
    const senha_hash = await hashPassword(senha);

    // Criar cliente
    const cliente = await createClientRecord({
      id: crypto.randomUUID(),
      nome,
      telefone,
      email,
      senha_hash,
      endereco,
      criado_em: new Date().toISOString()
    });

    // Criar token
    const token = await createClientToken(cliente.id);

    // Retornar token em cookie
    const response = NextResponse.json(
      { success: true, cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email } },
      { status: 201 }
    );

    response.cookies.set('cliente_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    });

    return response;
  } catch (error) {
    console.error('Erro no registro cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
