import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('brinquedo')
      .select('*')
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
      status
    } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('brinquedo')
      .insert({
        id: crypto.randomUUID(),
        nome,
        descricao,
        fotos: fotos || [],
        tema_layout,
        dimensoes,
        faixa_etaria,
        status: status || 'DISPONIVEL',
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
