import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const results = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    tests: []
  };

  try {
    // Teste 1: Verificar tabela brinquedo
    const { data: brinquedos, error: brinquedoError } = await supabaseAdmin
      .from('brinquedo')
      .select('*')
      .limit(1);

    results.tests.push({
      name: 'Tabela brinquedo',
      success: !brinquedoError,
      error: brinquedoError?.message,
      count: brinquedos?.length || 0
    });

    // Teste 2: Verificar tabela cliente
    const { data: clientes, error: clienteError } = await supabaseAdmin
      .from('cliente')
      .select('*')
      .limit(1);

    results.tests.push({
      name: 'Tabela cliente',
      success: !clienteError,
      error: clienteError?.message,
      count: clientes?.length || 0
    });

    // Teste 3: Verificar tabela locacao
    const { data: locacoes, error: locacaoError } = await supabaseAdmin
      .from('locacao')
      .select('*')
      .limit(1);

    results.tests.push({
      name: 'Tabela locacao',
      success: !locacaoError,
      error: locacaoError?.message,
      count: locacoes?.length || 0
    });

    // Teste 4: Tentar inserir um brinquedo de teste
    const { data: novoBrinquedo, error: insertError } = await supabaseAdmin
      .from('brinquedo')
      .insert({
        id: crypto.randomUUID(),
        nome: 'Teste API',
        descricao: 'Teste de inserção via API',
        fotos: '[]',
        tema_layout: 'classico_divertido',
        dimensoes: '3x3m',
        faixa_etaria: '3-5 anos',
        status: 'DISPONIVEL',
      })
      .select()
      .single();

    if (insertError) {
      results.tests.push({
        name: 'Inserir brinquedo',
        success: false,
        error: insertError.message
      });
    } else {
      results.tests.push({
        name: 'Inserir brinquedo',
        success: true,
        id: novoBrinquedo.id
      });

      // Deletar o brinquedo de teste
      await supabaseAdmin.from('brinquedo').delete().eq('id', novoBrinquedo.id);
    }

  } catch (error: any) {
    results.tests.push({
      name: 'Erro geral',
      success: false,
      error: error.message
    });
  }

  return NextResponse.json(results);
}
