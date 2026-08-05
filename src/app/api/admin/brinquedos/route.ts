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
      descricao,
      tema_layout,
      dimensoes,
      faixa_etaria,
      status
    } = body;

    // Validar campos obrigatórios
    if (!nome || !descricao) {
      return NextResponse.json(
        { error: 'Nome e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // Tentar inserção com SQL direto via Supabase
    const { data, error } = await supabaseAdmin
      .from('brinquedo')
      .insert({
        nome: String(nome),
        descricao: String(descricao),
        fotos: '[]',
        tema_layout: String(tema_layout || 'CLASSICO_DIVERTIDO'),
        dimensoes: String(dimensoes || ''),
        faixa_etaria: String(faixa_etaria || ''),
        status: String(status || 'DISPONIVEL'),
      })
      .select('id, nome, descricao')
      .single();

    if (error) {
      console.error('Erro Supabase ao criar brinquedo:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      console.error('Detalhes:', error.details);
      
      return NextResponse.json(
        { 
          error: 'Erro ao criar brinquedo no banco de dados', 
          details: error.message, 
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    console.log('Brinquedo criado com sucesso:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar brinquedo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar brinquedo', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
