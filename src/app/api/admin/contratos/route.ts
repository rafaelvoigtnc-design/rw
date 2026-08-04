import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('contratos')
      .select('*')
      .order('data_contrato', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar contratos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('contratos')
      .insert({
        id: crypto.randomUUID(),
        ...body,
        data_contrato: new Date().toISOString(),
        status: 'RASCUNHO',
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao criar contrato' },
      { status: 500 }
    );
  }
}
