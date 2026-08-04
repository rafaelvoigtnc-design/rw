import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('brinquedo')
      .select(`
        *,
        categoria (
          id,
          nome,
          icone
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Brinquedo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar brinquedo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar brinquedo' },
      { status: 500 }
    );
  }
}
