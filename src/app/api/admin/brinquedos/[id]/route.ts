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

    // Primeiro buscar o brinquedo atual para preservar categoria_id e preco_periodo
    const { data: brinquedoAtual } = await supabaseAdmin
      .from('brinquedo')
      .select('categoria_id, preco_periodo')
      .eq('id', params.id)
      .single();

    if (!brinquedoAtual) {
      return NextResponse.json(
        { error: 'Brinquedo não encontrado' },
        { status: 404 }
      );
    }

    // Converter fotos para JSON string se for array
    const fotosParaSalvar = Array.isArray(fotos) ? JSON.stringify(fotos) : (fotos || '[]');

    console.log('Fotos para salvar:', fotosParaSalvar);

    const updateData = {
      nome,
      descricao,
      fotos: fotosParaSalvar,
      tema_layout,
      dimensoes,
      faixa_etaria,
      status,
      categoria_id: brinquedoAtual.categoria_id, // Preservar categoria_id existente
      preco_periodo: brinquedoAtual.preco_periodo, // Preservar preco_periodo existente
    };

    const { data, error } = await supabaseAdmin
      .from('brinquedo')
      .update(updateData)
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

    // Primeiro buscar o brinquedo para obter as fotos
    const { data: brinquedo } = await supabaseAdmin
      .from('brinquedo')
      .select('fotos')
      .eq('id', params.id)
      .single();

    if (brinquedo && brinquedo.fotos) {
      // Deletar as imagens do storage
      const fotosArray = typeof brinquedo.fotos === 'string'
        ? JSON.parse(brinquedo.fotos)
        : brinquedo.fotos;

      for (const fotoUrl of fotosArray) {
        try {
          // Extrair o path da URL
          const urlParts = fotoUrl.split('/imagens/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabaseAdmin
              .storage
              .from('imagens')
              .remove([filePath]);
          }
        } catch (error) {
          console.error('Erro ao deletar imagem:', error);
        }
      }
    }

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
