import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const faixaEtaria = searchParams.get('faixaEtaria');
    const busca = searchParams.get('busca');

    let query = supabase
      .from('brinquedo')
      .select(`
        *,
        categoria (
          id,
          nome,
          icone
        )
      `)
      .eq('status', 'DISPONIVEL');

    if (categoria) {
      query = query.eq('categoria_id', categoria);
    }

    if (faixaEtaria) {
      query = query.eq('faixa_etaria', faixaEtaria);
    }

    if (busca) {
      query = query.ilike('nome', `%${busca}%`);
    }

    const { data, error } = await query.order('criado_em', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar brinquedos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar brinquedos' },
      { status: 500 }
    );
  }
}
