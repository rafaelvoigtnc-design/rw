import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brinquedoId = searchParams.get('brinquedo_id');

    let query = supabase
      .from('avaliacao')
      .select('*');

    if (brinquedoId) {
      query = query.eq('brinquedo_id', brinquedoId);
    } else {
      // Se não tiver brinquedo_id, retorna apenas aprovadas para home
      query = query.eq('aprovado_para_exibir', true);
    }

    query = query.order('criado_em', { ascending: false });

    const { data, error } = await query;

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
    const { texto, nota, brinquedoId } = await request.json();

    console.log('Dados recebidos para avaliação:', { texto, nota, brinquedoId });

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

    console.log('Cliente ID:', clienteId);

    // Criar avaliação
    const avaliacaoData = {
      id: crypto.randomUUID(),
      cliente_id: clienteId,
      texto: String(texto),
      nota: Number(nota),
      aprovado_para_exibir: false,
      exibir_no_home: false,
      criado_em: new Date().toISOString(),
    };

    console.log('Dados para inserir:', avaliacaoData);

    const { data, error } = await supabase
      .from('avaliacao')
      .insert(avaliacaoData)
      .select()
      .single();

    if (error) {
      console.error('Erro Supabase ao criar avaliação:', error);
      console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('Avaliação criada com sucesso:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar avaliação', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
