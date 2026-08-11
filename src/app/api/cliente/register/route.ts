import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { nome, telefone, email, senha, endereco } = await request.json();

    console.log('Dados de registro:', { nome, telefone, email, endereco });

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

    // Verificar se email já existe na tabela cliente
    const { data: existingClient } = await supabase
      .from('cliente')
      .select('email')
      .eq('email', email)
      .single();

    if (existingClient) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    console.log('Auth data:', authData);
    console.log('Auth error:', authError);

    if (authError) {
      console.error('Erro ao criar usuário no Supabase Auth:', authError);
      return NextResponse.json(
        { error: authError.message || 'Erro ao criar usuário no sistema de autenticação' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário: usuário não retornado' },
        { status: 500 }
      );
    }

    // Tentar criar registro na tabela cliente
    try {
      const { data: cliente, error: clienteError } = await supabase
        .from('cliente')
        .insert({
          id: crypto.randomUUID(),
          auth_id: authData.user.id,
          nome,
          telefone: telefoneLimpo,
          email,
          endereco,
          senha_hash: null, // Campo não usado mais, mas deve ser null se existir
          criado_em: new Date().toISOString(),
        })
        .select()
        .single();

      console.log('Cliente data:', cliente);
      console.log('Cliente error:', clienteError);

      if (clienteError) {
        console.error('Erro ao criar cliente na tabela:', clienteError);
        console.error('Código do erro:', clienteError.code);
        console.error('Mensagem do erro:', clienteError.message);
        console.error('Detalhes:', clienteError.details);
        
        // Rollback: deletar usuário do auth se falhar
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('Erro ao deletar usuário do auth:', deleteError);
        }

        // Verificar se o erro é por coluna auth_id não existir
        if (clienteError.message?.includes('auth_id') || clienteError.code === '42703') {
          return NextResponse.json(
            { error: 'A tabela cliente não tem o campo auth_id. Execute a migração SQL no Supabase.' },
            { status: 500 }
          );
        }

        // Retornar erro detalhado
        return NextResponse.json(
          { 
            error: clienteError.message || 'Erro ao criar cliente',
            code: clienteError.code,
            details: clienteError.details
          },
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
    } catch (insertError) {
      console.error('Erro ao inserir cliente:', insertError);
      
      // Rollback
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('Erro ao deletar usuário do auth:', deleteError);
      }

      return NextResponse.json(
        { error: 'Erro ao criar registro do cliente' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro no registro cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
