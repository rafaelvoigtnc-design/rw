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
      .from('favorito')
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
    console.error('Erro ao buscar favoritos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar favoritos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.match(/client_token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const clienteId = payload.id;

    const { brinquedoId } = await request.json();

    // Verificar se já é favorito
    const { data: existente } = await supabase
      .from('favorito')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('brinquedo_id', brinquedoId)
      .single();

    if (existente) {
      // Se já existe, remove (toggle)
      const { error } = await supabase
        .from('favorito')
        .delete()
        .eq('id', existente.id);

      if (error) throw error;

      return NextResponse.json({ favorito: false });
    }

    // Se não existe, adiciona
    const { data, error } = await supabase
      .from('favorito')
      .insert({
        id: crypto.randomUUID(),
        cliente_id: clienteId,
        brinquedo_id: brinquedoId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ favorito: true, data });
  } catch (error) {
    console.error('Erro ao gerenciar favorito:', error);
    return NextResponse.json(
      { error: 'Erro ao gerenciar favorito' },
      { status: 500 }
    );
  }
}
