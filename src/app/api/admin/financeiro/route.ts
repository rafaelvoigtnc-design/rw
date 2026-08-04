import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('transacao_financeira')
      .select('*')
      .order('data', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar transações financeiras:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar transações financeiras' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { tipo, valor, data, descricao, categoria } = await request.json();

    const { data: transacao, error } = await supabase
      .from('transacao_financeira')
      .insert({
        id: crypto.randomUUID(),
        tipo,
        valor,
        data,
        descricao,
        categoria: categoria || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(transacao);
  } catch (error) {
    console.error('Erro ao criar transação financeira:', error);
    return NextResponse.json(
      { error: 'Erro ao criar transação financeira' },
      { status: 500 }
    );
  }
}
