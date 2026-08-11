import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const faixaEtaria = searchParams.get('faixaEtaria');
    const busca = searchParams.get('busca');
    const ordenacao = searchParams.get('ordenacao') || 'nome';

    let query = supabase
      .from('brinquedo')
      .select('*')
      .eq('status', 'DISPONIVEL');

    if (faixaEtaria) {
      query = query.eq('faixa_etaria', faixaEtaria);
    }

    if (busca) {
      query = query.ilike('nome', `%${busca}%`);
    }

    if (ordenacao === 'nome') {
      query = query.order('nome', { ascending: true });
    } else if (ordenacao === 'nome_desc') {
      query = query.order('nome', { ascending: false });
    } else if (ordenacao === 'avaliacao') {
      query = query.order('avaliacao_media', { ascending: false, nullsFirst: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    // Converter fotos de JSON string para array
    const brinquedosFormatados = data.map((b: any) => ({
      ...b,
      fotos: typeof b.fotos === 'string' ? JSON.parse(b.fotos) : (b.fotos || []),
    }));

    return NextResponse.json(brinquedosFormatados);
  } catch (error) {
    console.error('Erro ao buscar brinquedos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar brinquedos' },
      { status: 500 }
    );
  }
}
