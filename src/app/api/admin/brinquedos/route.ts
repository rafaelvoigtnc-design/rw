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
    console.log('Variáveis de ambiente:', {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'Não configurada',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'Não configurada',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada' : 'Não configurada',
    });

    const {
      nome,
      descricao,
      fotos,
      tema_layout,
      dimensoes,
      faixa_etaria,
      status,
      preco_periodo
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

    const brinquedoData = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      descricao: descricao.trim(),
      fotos: fotosParaSalvar,
      tema_layout: tema_layout || 'CLASSICO_DIVERTIDO',
      dimensoes: dimensoes || '',
      faixa_etaria: faixa_etaria || '',
      status: status || 'DISPONIVEL',
      preco_periodo: preco_periodo || 0,
    };

    console.log('Dados para inserir:', brinquedoData);

    // Primeiro, testar a conexão
    const { data: testData, error: testError } = await supabaseAdmin
      .from('brinquedo')
      .select('id')
      .limit(1);

    console.log('Teste de conexão:', { testData, testError });

    const { data, error } = await supabaseAdmin
      .from('brinquedo')
      .insert(brinquedoData)
      .select()
      .single();

    if (error) {
      console.error('Erro Supabase ao criar brinquedo:', error);
      console.error('Detalhes completos do erro:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Erro ao criar brinquedo no banco de dados', details: error.message, code: error.code, fullError: error },
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
