import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.match(/client_token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const clienteId = payload.id;

    const { data, error } = await supabase
      .from('carrinho_item')
      .select(`
        *,
        brinquedo (
          id,
          nome,
          fotos,
          tema_layout
        )
      `)
      .eq('cliente_id', clienteId);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar carrinho' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    console.log('Cookie header:', cookieHeader);
    
    const token = cookieHeader?.match(/client_token=([^;]+)/)?.[1];
    console.log('Token extraído:', token ? 'Presente' : 'Ausente');
    
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado - token não encontrado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    console.log('Payload do token:', payload);
    const clienteId = payload.id;

    const { brinquedoId, dataInteresse } = await request.json();
    console.log('Brinquedo ID:', brinquedoId);

    // Verificar se já existe no carrinho
    const { data: existente } = await supabase
      .from('carrinho_item')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('brinquedo_id', brinquedoId)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: 'Brinquedo já está no carrinho' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('carrinho_item')
      .insert({
        id: crypto.randomUUID(),
        cliente_id: clienteId,
        brinquedo_id: brinquedoId,
        data_interesse: dataInteresse || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar ao carrinho' },
      { status: 500 }
    );
  }
}
