import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, createClientToken } from '@/lib/auth';

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

    // Hash da senha
    const senha_hash = await hashPassword(senha);

    // Criar cliente diretamente na tabela (sem Supabase Auth)
    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .insert({
        id: crypto.randomUUID(),
        nome,
        telefone: telefoneLimpo,
        email,
        senha_hash,
        endereco,
        criado_em: new Date().toISOString(),
      })
      .select()
      .single();

    console.log('Cliente data:', cliente);
    console.log('Cliente error:', clienteError);

    if (clienteError) {
      console.error('Erro ao criar cliente:', clienteError);
      return NextResponse.json(
        { error: clienteError.message || 'Erro ao criar cliente' },
        { status: 500 }
      );
    }

    // Criar token JWT
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
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
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
