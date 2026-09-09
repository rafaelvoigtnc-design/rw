import { NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('🔍 Iniciando upload como base64...');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('📦 Arquivo recebido:', file ? 'Sim' : 'Não');
    if (file) {
      console.log('   Nome:', file.name);
      console.log('   Tipo:', file.type);
      console.log('   Tamanho:', file.size, 'bytes');
    }

    if (!file) {
      console.error('❌ Nenhum arquivo enviado');
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      console.error('❌ Arquivo não é imagem:', file.type);
      return NextResponse.json(
        { error: 'Apenas imagens são permitidas' },
        { status: 400 }
      );
    }

    // Verificar tamanho (limite de 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('❌ Arquivo muito grande:', file.size, 'bytes (máximo:', maxSize, ')');
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB' },
        { status: 400 }
      );
    }

    console.log('✅ Validações passadas, iniciando processamento...');

    // Converter para buffer
    const arrayBuffer = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(arrayBuffer);
    console.log('📄 Buffer original:', buffer.byteLength, 'bytes');

    // Comprimir imagem apenas se for grande
    console.log('🔄 Verificando se precisa comprimir...');
    try {
      buffer = await compressImage(buffer, file.size);
      console.log('✅ Imagem processada:', buffer.byteLength, 'bytes');
    } catch (compressError) {
      console.error('❌ Erro ao comprimir imagem:', compressError);
      throw new Error('Erro ao comprimir imagem');
    }

    // Converter para base64
    const base64 = buffer.toString('base64');
    const mimeType = file.type.startsWith('image/') ? file.type : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    console.log('📝 Imagem convertida para data URL, tamanho:', dataUrl.length, 'caracteres');

    console.log('🎉 Upload concluído com sucesso!');

    return NextResponse.json({ url: dataUrl, size: dataUrl.length });
  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error);
    console.error('Detalhes do erro:', String(error));
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Erro ao fazer upload da imagem', details: String(error) },
      { status: 500 }
    );
  }
}

async function compressImage(buffer: Uint8Array, originalSize: number): Promise<Buffer> {
  // Se a imagem já for pequena (< 500KB), não comprime para não aumentar o tamanho
  if (originalSize < 500 * 1024) {
    console.log('📏 Imagem pequena, mantendo original');
    return Buffer.from(buffer);
  }

  // Se for grande, comprime com qualidade ajustada
  const compressed = await sharp(buffer)
    .resize(1920, 1080, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();
  
  // Se a compressão aumentou o tamanho, usa o original
  if (compressed.length > buffer.length) {
    console.log('⚠️ Compressão aumentou tamanho, usando original');
    return Buffer.from(buffer);
  }
  
  return Buffer.from(compressed);
}
