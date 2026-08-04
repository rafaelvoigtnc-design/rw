import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    console.log('Testando conexão com Supabase...');
    
    // Testar conexão básica
    const { data: testData, error: testError } = await supabase
      .from('banners')
      .select('count')
      .single();
    
    console.log('Teste de conexão:', { testData, testError });
    
    // Listar todas as tabelas
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_tables');
    
    console.log('Tabelas disponíveis:', { tablesData, tablesError });
    
    // Tentar buscar banners
    const { data: banners, error: bannersError } = await supabase
      .from('banners')
      .select('*');
    
    console.log('Banners encontrados:', { banners, bannersError });
    
    // Tentar buscar conteúdo
    const { data: conteudo, error: conteudoError } = await supabase
      .from('conteudo_pagina')
      .select('*')
      .limit(5);
    
    console.log('Conteúdo encontrado:', { conteudo, conteudoError });
    
    return NextResponse.json({
      success: true,
      connectionTest: { testData, testError },
      tables: { tablesData, tablesError },
      banners: { count: banners?.length || 0, data: banners, error: bannersError },
      conteudo: { count: conteudo?.length || 0, data: conteudo, error: conteudoError },
    });
  } catch (error) {
    console.error('Erro no teste:', error);
    return NextResponse.json(
      { error: 'Erro no teste', details: String(error) },
      { status: 500 }
    );
  }
}
