import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    console.log('Buscando banners do Supabase (admin)...');
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('ordem');

    console.log('Resultado da query (admin):', { data, error });

    if (error) {
      console.error('Erro do Supabase (admin):', error);
      throw error;
    }

    console.log(`Retornando ${data?.length || 0} banners (admin)`);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro ao buscar banners (admin):', error);
    return NextResponse.json(
      { error: 'Erro ao buscar banners', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Buscar maior ordem atual
    const { data: banners } = await supabaseAdmin
      .from('banners')
      .select('ordem')
      .order('ordem', { ascending: false })
      .limit(1);
    
    const novaOrdem = banners && banners.length > 0 ? (banners[0].ordem || 0) + 1 : 0;

    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert({
        id: crypto.randomUUID(),
        ...body,
        ordem: body.ordem !== undefined ? body.ordem : novaOrdem,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar banner:', error);
    return NextResponse.json(
      { error: 'Erro ao criar banner' },
      { status: 500 }
    );
  }
}
