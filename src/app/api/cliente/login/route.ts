import { NextRequest, NextResponse } from 'next/server';
import { getClientByEmail } from '@/lib/supabase';
import { verifyPassword, createClientToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    console.log('Tentativa de login:', email);

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar cliente
    const cliente = await getClientByEmail(email);

    if (!cliente) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar senha
    const isValid = await verifyPassword(senha, cliente.senha_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Criar token
    const token = await createClientToken(cliente.id);

    console.log('Login bem-sucedido:', cliente.email);

    // Retornar token em cookie
    const response = NextResponse.json(
      { success: true, cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email } },
      { status: 200 }
    );

    response.cookies.set('cliente_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro no login cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
