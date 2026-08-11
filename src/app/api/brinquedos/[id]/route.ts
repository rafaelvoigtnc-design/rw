import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('brinquedo')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Brinquedo não encontrado' },
        { status: 404 }
      );
    }

    // Converter fotos de JSON string para array
    const brinquedoFormatado = {
      ...data,
      fotos: typeof data.fotos === 'string' ? JSON.parse(data.fotos) : (data.fotos || []),
      categoria: data.categoria_id ? { nome: 'Categoria' } : null, // Categoria placeholder
    };

    return NextResponse.json(brinquedoFormatado);
  } catch (error) {
    console.error('Erro ao buscar brinquedo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar brinquedo' },
      { status: 500 }
    );
  }
}
