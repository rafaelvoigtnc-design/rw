import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { titulo, descricao, data_inicio, data_fim, ativa } = await request.json();

    const { data, error } = await supabase
      .from('promocao')
      .update({
        titulo,
        descricao,
        data_inicio,
        data_fim,
        ativa,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar promoção:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar promoção' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('promocao')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar promoção:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar promoção' },
      { status: 500 }
    );
  }
}
