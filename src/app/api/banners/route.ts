import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    console.log('Buscando banners do Supabase...');
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('ativo', true)
      .order('ordem');

    console.log('Resultado da query:', { data, error });

    if (error) {
      console.error('Erro do Supabase:', error);
      throw error;
    }

    console.log(`Retornando ${data?.length || 0} banners`);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro ao buscar banners:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar banners', details: String(error) },
      { status: 500 }
    );
  }
}
