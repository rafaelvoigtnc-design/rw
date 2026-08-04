import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar dados do cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .select('*')
      .eq('id', params.id)
      .single();

    if (clienteError) throw clienteError;

    // Buscar carrinho atual
    const { data: carrinho } = await supabase
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
      .eq('cliente_id', params.id);

    // Buscar histórico de locações
    const { data: locacoes } = await supabase
      .from('locacao')
      .select(`
        *,
        locacao_item (
          id,
          brinquedo_id,
          brinquedo (
            nome
          )
        )
      `)
      .eq('cliente_id', params.id)
      .order('data_evento', { ascending: false });

    // Buscar favoritos
    const { data: favoritos } = await supabase
      .from('favorito')
      .select(`
        *,
        brinquedo (
          nome,
          fotos
        )
      `)
      .eq('cliente_id', params.id);

    // Buscar avaliações
    const { data: avaliacoes } = await supabase
      .from('avaliacao')
      .select('*')
      .eq('cliente_id', params.id)
      .order('criado_em', { ascending: false });

    return NextResponse.json({
      cliente,
      carrinho: carrinho || [],
      locacoes: locacoes || [],
      favoritos: favoritos || [],
      avaliacoes: avaliacoes || [],
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes do cliente' },
      { status: 500 }
    );
  }
}
