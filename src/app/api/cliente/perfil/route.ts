import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar token com Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Buscar dados do cliente
    const { data: cliente, error } = await supabase
      .from('cliente')
      .select('id, nome, telefone, email, endereco')
      .eq('auth_id', user.id)
      .single();

    if (error || !cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();
    const { nome, telefone, email, endereco } = body;

    // Validar telefone
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      return NextResponse.json({ error: 'O telefone deve ter exatamente 11 dígitos' }, { status: 400 });
    }

    // Buscar cliente atual
    const { data: clienteAtual } = await supabase
      .from('cliente')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!clienteAtual) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Verificar se o email já está em uso por outro cliente
    const { data: clienteExistente } = await supabase
      .from('cliente')
      .select('id')
      .eq('email', email)
      .neq('id', clienteAtual.id)
      .single();

    if (clienteExistente) {
      return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 });
    }

    // Atualizar cliente
    const { error } = await supabase
      .from('cliente')
      .update({
        nome,
        telefone: telefoneLimpo,
        email,
        endereco,
      })
      .eq('id', clienteAtual.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
