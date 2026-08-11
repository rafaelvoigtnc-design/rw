import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

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
    const { texto, nota } = await request.json();

    console.log('Dados recebidos para avaliação:', { texto, nota });

    // Verificar se há token de cliente
    const cookieHeader = request.headers.get('cookie');
    const token = cookieHeader?.match(/client_token=([^;]+)/)?.[1];

    if (!token) {
      console.log('Token não encontrado');
      return NextResponse.json(
        { error: 'Você precisa estar logado para deixar um depoimento' },
        { status: 401 }
      );
    }

    // Verificar o token diretamente
    const payload = await verifyToken(token);
    console.log('Payload do token:', payload);

    if (!payload || payload.type !== 'client') {
      console.log('Token inválido ou não é de cliente');
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const clienteId = payload.id;
    console.log('Cliente ID:', clienteId);

    // Criar avaliação
    const avaliacaoData = {
      id: crypto.randomUUID(),
      cliente_id: clienteId,
      texto: String(texto),
      nota: Number(nota),
      aprovado_para_exibir: false,
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
