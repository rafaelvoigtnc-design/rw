import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pagina = searchParams.get('pagina');

    let query = supabaseAdmin.from('conteudo_pagina').select('*');
    
    if (pagina) {
      query = query.eq('pagina', pagina);
    }

    const { data, error } = await query.order('pagina').order('chave');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar conteúdo' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { pagina, chave, valor, tipo } = await request.json();

    // Verificar se já existe
    const { data: existente } = await supabaseAdmin
      .from('conteudo_pagina')
      .select('*')
      .eq('pagina', pagina)
      .eq('chave', chave)
      .single();

    if (existente) {
      // Atualizar existente
      const { data, error } = await supabaseAdmin
        .from('conteudo_pagina')
        .update({ valor, tipo, atualizado_em: new Date().toISOString() })
        .eq('id', existente.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    // Criar novo
    const { data, error } = await supabaseAdmin
      .from('conteudo_pagina')
      .insert({
        id: crypto.randomUUID(),
        pagina,
        chave,
        valor,
        tipo: tipo || 'texto',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao salvar conteúdo:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar conteúdo' },
      { status: 500 }
    );
  }
}
