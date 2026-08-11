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
      fotos,
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

    // Converter fotos para JSON string se for array
    const fotosParaSalvar = Array.isArray(fotos) ? JSON.stringify(fotos) : (fotos || '[]');

    // Versão com todos os campos obrigatórios
    const brinquedoData = {
      id: crypto.randomUUID(),
      nome: String(nome),
      descricao: String(descricao),
      fotos: fotosParaSalvar,
      dimensoes: String(dimensoes || ''),
      faixa_etaria: String(faixa_etaria || ''),
      status: String(status || 'DISPONIVEL'),
      categoria_id: null,
      preco_periodo: 0,
    };

    console.log('Dados para inserir:', brinquedoData);

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
