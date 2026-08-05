import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('Iniciando upload de arquivo...');
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('Nenhum arquivo enviado');
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    console.log('Arquivo recebido:', file.name, 'Tipo:', file.type, 'Tamanho:', file.size);

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Tipo de arquivo não permitido:', file.type);
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('Arquivo muito grande:', file.size);
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    // Gerar nome único do arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    console.log('Nome do arquivo gerado:', fileName);

    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Iniciando upload para Supabase Storage...');

    // Fazer upload para Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('brinquedos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Erro ao fazer upload para Supabase:', error);
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo para o storage', details: error.message },
        { status: 500 }
      );
    }

    console.log('Upload concluído com sucesso:', data);

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('brinquedos')
      .getPublicUrl(fileName);

    console.log('URL pública gerada:', publicUrl);

    return NextResponse.json({
      url: publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload do arquivo', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
