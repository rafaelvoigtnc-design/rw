import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('avaliacao')
      .select(`
        *,
        cliente (
          nome
        )
      `)
      .eq('aprovado_para_exibir', true)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { texto, nota } = await request.json();

    // Verificar se há token de cliente
    const cookieHeader = request.headers.get('cookie');
    const token = cookieHeader?.match(/client_token=([^;]+)/)?.[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Você precisa estar logado para deixar um depoimento' },
        { status: 401 }
      );
    }

    // Verificar o token e obter o cliente_id
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/cliente/perfil`, {
      headers: {
        cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao verificar autenticação' },
        { status: 401 }
      );
    }

    const clienteData = await response.json();
    const clienteId = clienteData.id;

    // Criar avaliação
    const { data, error } = await supabase
      .from('avaliacao')
      .insert({
        id: crypto.randomUUID(),
        cliente_id: clienteId,
        texto,
        nota,
        aprovado_para_exibir: false,
        exibir_no_home: false,
        criado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar avaliação' },
      { status: 500 }
    );
  }
}
