import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('brinquedo')
      .select(`
        *,
        categoria (
          nome
        )
      `)
      .order('nome');

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

export async function POST(request: Request) {
  try {
    const { 
      nome, 
      descricao, 
      fotos, 
      tema_layout, 
      dimensoes, 
      faixa_etaria, 
      preco_periodo, 
      status,
      categoria_id 
    } = await request.json();

    const { data, error } = await supabase
      .from('brinquedo')
      .insert({
        id: crypto.randomUUID(),
        nome,
        descricao,
        fotos: fotos || [],
        tema_layout,
        dimensoes,
        faixa_etaria,
        preco_periodo,
        status: status || 'DISPONIVEL',
        categoria_id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar brinquedo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar brinquedo' },
      { status: 500 }
    );
  }
}
