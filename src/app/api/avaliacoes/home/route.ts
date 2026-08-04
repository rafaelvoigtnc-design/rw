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
      .eq('exibir_no_home', true)
      .eq('aprovado_para_exibir', true)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro ao buscar avaliações do home:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações do home' },
      { status: 500 }
    );
  }
}
