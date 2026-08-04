import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('dados_empresa')
      .select('*')
      .single();

    if (error) {
      // Se não encontrar, retorna um objeto vazio
      if (error.code === 'PGRST116') {
        return NextResponse.json(null);
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados da empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados da empresa' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verificar se já existe um registro
    const { data: existente } = await supabaseAdmin
      .from('dados_empresa')
      .select('*')
      .single();

    if (existente) {
      // Atualizar existente
      const { data, error } = await supabaseAdmin
        .from('dados_empresa')
        .update({
          ...body,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', existente.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    // Criar novo
    const { data, error } = await supabaseAdmin
      .from('dados_empresa')
      .insert({
        id: 'empresa_01',
        ...body,
        atualizado_em: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao salvar dados da empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar dados da empresa' },
      { status: 500 }
    );
  }
}
