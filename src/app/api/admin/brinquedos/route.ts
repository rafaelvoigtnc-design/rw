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
    console.log('Dados recebidos para criar brinquedo:', body);

    const {
      nome,
      descricao,
      fotos,
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

    // Converter fotos para JSON string se for array
    const fotosParaSalvar = Array.isArray(fotos) ? JSON.stringify(fotos) : (fotos || '[]');

    console.log('Fotos para salvar:', fotosParaSalvar);

    const { data, error } = await supabaseAdmin
      .from('brinquedo')
      .insert({
        id: crypto.randomUUID(),
        nome,
        descricao,
        fotos: fotosParaSalvar,
        tema_layout,
        dimensoes,
        faixa_etaria,
        status: status || 'DISPONIVEL',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro Supabase ao criar brinquedo:', error);
      throw error;
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
