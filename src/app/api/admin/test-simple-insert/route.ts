import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Teste ultra simples - apenas nome e descricao
    const { nome, descricao } = await request.json();

    console.log('Teste de inserção simples:', { nome, descricao });

    const { data, error } = await supabaseAdmin
      .from('brinquedo')
      .insert({
        nome: String(nome),
        descricao: String(descricao),
        fotos: '[]',
        tema_layout: 'CLASSICO_DIVERTIDO',
        dimensoes: '',
        faixa_etaria: '',
        status: 'DISPONIVEL',
      })
      .select();

    if (error) {
      console.error('ERRO DETALHADO:', JSON.stringify(error, null, 2));
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('ERRO CATCH:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error
    }, { status: 500 });
  }
}
