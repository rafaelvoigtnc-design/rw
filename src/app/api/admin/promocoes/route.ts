import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('promocao')
      .select('*')
      .order('data_inicio', { ascending: false });

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

export async function POST(request: Request) {
  try {
    const { titulo, descricao, data_inicio, data_fim, ativa } = await request.json();

    const { data, error } = await supabase
      .from('promocao')
      .insert({
        id: crypto.randomUUID(),
        titulo,
        descricao,
        data_inicio,
        data_fim,
        ativa: ativa || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    return NextResponse.json(
      { error: 'Erro ao criar promoção' },
      { status: 500 }
    );
  }
}
