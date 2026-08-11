import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filtro = searchParams.get('filtro') || 'todas';

    let query = supabaseAdmin
      .from('avaliacao')
      .select('*');

    // Aplicar filtros
    if (filtro === 'pendentes') {
      query = query.eq('aprovado_para_exibir', false);
    } else if (filtro === 'aprovadas') {
      query = query.eq('aprovado_para_exibir', true);
    } else if (filtro === 'brinquedos') {
      query = query.not('brinquedo_id', 'is', null);
    }

    const { data, error } = await query.order('criado_em', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    );
  }
}
