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
    const body = await request.json();

    console.log('Dados recebidos:', body);

    const {
      nome,
      descricao
    } = body;

    // Validar campos obrigatórios
    if (!nome || !descricao) {
      return NextResponse.json(
        { error: 'Nome e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // Versão MINIMA absoluta - apenas nome e descricao
    const brinquedoData = {
      nome,
      descricao,
    };

    console.log('Dados para inserir (MINIMO):', brinquedoData);

    const { data, error } = await supabaseAdmin
      .from('brinquedo')
      .insert(brinquedoData)
      .select();

    if (error) {
      console.error('Erro Supabase ao criar brinquedo:', error);
      console.error('Detalhes completos do erro:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Erro ao criar brinquedo no banco de dados', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    console.log('Brinquedo criado com sucesso:', data);
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Erro ao criar brinquedo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar brinquedo', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
