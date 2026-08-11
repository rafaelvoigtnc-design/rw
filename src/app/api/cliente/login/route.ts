import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Usar Supabase Auth para login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    console.log('Auth data:', data);
    console.log('Auth error:', error);

    if (error) {
      console.error('Erro de autenticação:', error);
      return NextResponse.json(
        { error: error.message || 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Erro ao fazer login: sessão não criada' },
        { status: 500 }
      );
    }

    // Buscar dados do cliente na tabela customizada
    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();

    console.log('Cliente data:', cliente);
    console.log('Cliente error:', clienteError);

    if (clienteError) {
      console.error('Erro ao buscar cliente:', clienteError);
      
      if (clienteError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Cliente não encontrado. Você precisa se registrar primeiro.' },
          { status: 404 }
        );
      }
      
      if (clienteError.message?.includes('auth_id')) {
        return NextResponse.json(
          { error: 'A tabela cliente não tem o campo auth_id. Execute a migração SQL no Supabase.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Erro ao buscar dados do cliente' },
        { status: 500 }
      );
    }

    if (!cliente) {
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

    console.log('Login realizado com sucesso para:', cliente.email);
    return response;
  } catch (error) {
    console.error('Erro no login cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
