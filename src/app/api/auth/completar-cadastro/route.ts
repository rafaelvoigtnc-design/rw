import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { telefone, endereco } = await request.json();

    // Validar telefone
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      return NextResponse.json({ error: 'O telefone deve ter exatamente 11 dígitos' }, { status: 400 });
    }

    // Criar cliente na tabela
    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .insert({
        id: crypto.randomUUID(),
        auth_id: user.id,
        nome: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
        telefone: telefoneLimpo,
        email: user.email || '',
        endereco,
        criado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (clienteError) {
      console.error('Erro ao criar cliente:', clienteError);
      return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
    }

    // Remover cookie temporário
    const response = NextResponse.json({ success: true, cliente });
    response.cookies.delete('google_auth_user_id', { path: '/' });

    return response;
  } catch (error) {
    console.error('Erro ao completar cadastro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
