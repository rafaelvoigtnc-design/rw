import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Limpar telefone
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      return NextResponse.json(
        { error: 'O telefone deve ter exatamente 11 dígitos' },
        { status: 400 }
      );
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    // Criar registro na tabela cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .insert({
        id: crypto.randomUUID(),
        auth_id: authData.user.id,
        nome,
        telefone: telefoneLimpo,
        email,
        endereco,
        criado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (clienteError) {
      // Rollback: deletar usuário do auth se falhar
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erro ao criar cliente' },
        { status: 500 }
      );
    }

    // Retornar sessão em cookie
    const response = NextResponse.json(
      { success: true, cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email } },
      { status: 201 }
    );

    if (authData.session) {
      response.cookies.set('sb-access-token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Erro no registro cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
