import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Usar Supabase Auth para login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Buscar dados do cliente na tabela customizada
    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Retornar sessão em cookie
    const response = NextResponse.json(
      { success: true, cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email } },
      { status: 200 }
    );

    // Set session cookie
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
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
