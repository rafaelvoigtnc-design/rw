import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken, hashPassword } from '@/lib/auth';

async function getClientId(request: NextRequest) {
  // Primeiro tenta verificar via Google Auth
  const accessToken = request.cookies.get('sb-access-token')?.value;
  if (accessToken) {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!error && user) {
      // Buscar cliente pelo email
      const { data: cliente } = await supabase
        .from('cliente')
        .select('id')
        .eq('email', user.email)
        .single();
      if (cliente) return cliente.id;
    }
  }

  // Se não tiver Google Auth, tenta via JWT
  const token = request.cookies.get('cliente_token')?.value;
  if (token) {
    const payload = await verifyToken(token);
    if (payload && payload.type === 'client') {
      return payload.id;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const clienteId = await getClientId(request);
    
    if (!clienteId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados do cliente
    const { data: cliente, error } = await supabase
      .from('cliente')
      .select('id, nome, telefone, email, endereco')
      .eq('id', clienteId)
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
    const clienteId = await getClientId(request);
    if (!clienteId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { nome, telefone, email, senha, endereco } = body;

    // Validar telefone
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      return NextResponse.json({ error: 'O telefone deve ter exatamente 11 dígitos' }, { status: 400 });
    }

    // Preparar dados para atualizar
    const updateData: any = {
      nome,
      telefone: telefoneLimpo,
      email,
      endereco,
    };

    // Se senha foi fornecida, atualizar também
    if (senha && senha.length >= 6) {
      updateData.senha_hash = await hashPassword(senha);
    }

    // Verificar se o email já está em uso por outro cliente
    const { data: clienteExistente } = await supabase
      .from('cliente')
      .select('id')
      .eq('email', email)
      .neq('id', clienteId)
      .single();

    if (clienteExistente) {
      return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 });
    }

    // Atualizar cliente
    const { error } = await supabase
      .from('cliente')
      .update(updateData)
      .eq('id', clienteId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
