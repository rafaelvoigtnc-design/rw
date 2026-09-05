import { NextResponse } from 'next/server';
import { getBrinquedoById, updateBrinquedo, deleteBrinquedo } from '@/lib/firebase-db';

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
      dimensoes,
      faixa_etaria,
      status,
      categoria_id,
      preco_periodo,
      tema_layout
    } = body;

    // Primeiro buscar o brinquedo atual para preservar campos não enviados
    const brinquedoAtual = await getBrinquedoById(params.id);

    if (!brinquedoAtual) {
      return NextResponse.json(
        { error: 'Brinquedo não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados de atualização
    const updateData = {
      nome: nome || brinquedoAtual.nome,
      descricao: descricao || brinquedoAtual.descricao,
      fotos: Array.isArray(fotos) ? fotos : (fotos || brinquedoAtual.fotos),
      tema_layout: tema_layout || brinquedoAtual.tema_layout,
      dimensoes: dimensoes || brinquedoAtual.dimensoes,
      faixa_etaria: faixa_etaria || brinquedoAtual.faixa_etaria,
      status: status || brinquedoAtual.status,
      categoria_id: categoria_id !== undefined ? categoria_id : brinquedoAtual.categoria_id,
      preco_periodo: preco_periodo !== undefined ? preco_periodo : brinquedoAtual.preco_periodo,
    };

    console.log('Dados para atualizar:', updateData);

    const data = await updateBrinquedo(params.id, updateData);

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

    // Buscar o brinquedo para obter as fotos (se quiser deletar imagens depois)
    const brinquedo = await getBrinquedoById(params.id);

    if (brinquedo && brinquedo.fotos) {
      // Implementar deleção de imagens do Firebase Storage se necessário
      const fotosArray = Array.isArray(brinquedo.fotos) ? brinquedo.fotos : [];
      console.log('Imagens para deletar:', fotosArray);
      // Implementar deleção do Storage quando configurado
    }

    await deleteBrinquedo(params.id);

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
