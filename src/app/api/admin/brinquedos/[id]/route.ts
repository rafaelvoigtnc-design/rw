import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const {
      nome,
      descricao,
      fotos,
      tema_layout,
      dimensoes,
      faixa_etaria,
      status
    } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('brinquedo')
      .update({
        nome,
        descricao,
        fotos,
        tema_layout,
        dimensoes,
        faixa_etaria,
        status,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar brinquedo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar brinquedo' },
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
      .from('brinquedo')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar brinquedo:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar brinquedo' },
      { status: 500 }
    );
  }
}
