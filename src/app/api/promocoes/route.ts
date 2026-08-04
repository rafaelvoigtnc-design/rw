import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('promocao')
      .select('*')
      .eq('ativa', true)
      .gte('data_inicio', now)
      .lte('data_fim', now)
      .order('data_inicio', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar promoções' },
      { status: 500 }
    );
  }
}
