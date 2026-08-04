import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Atualizando brinquedo ID:', params.id);
    const body = await request.json();
    console.log('Dados recebidos para atualização:', body);

    const {
      nome,
      descricao,
      fotos,
      tema_layout,
      dimensoes,
      faixa_etaria,
      status
    } = body;

    // Converter fotos para JSON string se for array
    const fotosParaSalvar = Array.isArray(fotos) ? JSON.stringify(fotos) : (fotos || '[]');

    console.log('Fotos para salvar:', fotosParaSalvar);

    const { data, error } = await supabaseAdmin
      .from('brinquedo')
      .update({
        nome,
        descricao,
        fotos: fotosParaSalvar,
        tema_layout,
        dimensoes,
        faixa_etaria,
        status,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Erro Supabase ao atualizar brinquedo:', error);
      throw error;
    }

    console.log('Brinquedo atualizado com sucesso:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar brinquedo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar brinquedo', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Deletando brinquedo ID:', params.id);
    const { error } = await supabaseAdmin
      .from('brinquedo')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Erro Supabase ao deletar brinquedo:', error);
      throw error;
    }

    console.log('Brinquedo deletado com sucesso');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar brinquedo:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar brinquedo', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
