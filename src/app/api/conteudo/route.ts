import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pagina = searchParams.get('pagina');
    const chave = searchParams.get('chave');

    let query = supabase.from('conteudo_pagina').select('*');
    
    if (pagina) {
      query = query.eq('pagina', pagina);
    }
    
    if (chave) {
      query = query.eq('chave', chave);
    }

    const { data, error } = await query.order('pagina').order('chave');

    if (error) throw error;

    // Se buscar por chave específica, retorna apenas o valor
    if (chave && data && data.length > 0) {
      return NextResponse.json(data[0]);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar conteúdo' },
      { status: 500 }
    );
  }
}
