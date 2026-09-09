import { NextResponse } from 'next/server';
import { getBrinquedoById, updateBrinquedo, deleteBrinquedo } from '@/lib/firebase-db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Atualizando brinquedo ID:', params.id);
    const body = await request.json();
    console.log('📦 Dados recebidos para atualização:', body);

    const {
      nome,
      descricao,
      fotos,
      dimensoes,
      faixa_etaria,
      status,
      categoria_id,
      preco_periodo,
      tema_layout,
      destaque_home
    } = body;

    console.log('📊 Tamanho das fotos:', Array.isArray(fotos) ? fotos.length : 0);
    if (Array.isArray(fotos)) {
      fotos.forEach((foto, index) => {
        console.log(`   Foto ${index + 1}:`, foto.length, 'caracteres');
      });
    }

    // Primeiro buscar o brinquedo atual para preservar campos não enviados
    console.log('🔍 Buscando brinquedo atual...');
    const brinquedoAtual = await getBrinquedoById(params.id);

    if (!brinquedoAtual) {
      console.error('❌ Brinquedo não encontrado');
      return NextResponse.json(
        { error: 'Brinquedo não encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Brinquedo atual encontrado');

    // Preparar dados de atualização
    const updateData = {
      nome: nome || (brinquedoAtual as any).nome,
      descricao: descricao || (brinquedoAtual as any).descricao,
      fotos: Array.isArray(fotos) ? fotos : (fotos || (brinquedoAtual as any).fotos),
      tema_layout: tema_layout || (brinquedoAtual as any).tema_layout,
      dimensoes: dimensoes || (brinquedoAtual as any).dimensoes,
      faixa_etaria: faixa_etaria || (brinquedoAtual as any).faixa_etaria,
      status: status || (brinquedoAtual as any).status,
      categoria_id: categoria_id !== undefined ? categoria_id : (brinquedoAtual as any).categoria_id,
      preco_periodo: preco_periodo !== undefined ? preco_periodo : (brinquedoAtual as any).preco_periodo,
      destaque_home: destaque_home !== undefined ? Boolean(destaque_home) : (brinquedoAtual as any).destaque_home || false,
    };

    console.log('📝 Dados para atualizar:', updateData);

    console.log('⬆️ Iniciando atualização no Firestore...');
    const data = await updateBrinquedo(params.id, updateData);

    console.log('✅ Brinquedo atualizado com sucesso:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Erro ao atualizar brinquedo:', error);
    console.error('Detalhes do erro:', String(error));
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
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

    if (brinquedo && (brinquedo as any).fotos) {
      // Implementar deleção de imagens do Firebase Storage se necessário
      const fotosArray = Array.isArray((brinquedo as any).fotos) ? (brinquedo as any).fotos : [];
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
