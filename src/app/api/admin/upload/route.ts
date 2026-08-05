import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'O arquivo deve ser uma imagem' },
        { status: 400 }
      );
    }

    // Validar tamanho (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 10MB' },
        { status: 400 }
      );
    }

    // Converter arquivo para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `brinquedos/${fileName}`;

    // Verificar se o bucket existe, se não, criar
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'imagens');

    if (!bucketExists) {
      console.log('Bucket "imagens" não existe, criando...');
      const { error: createError } = await supabaseAdmin.storage.createBucket('imagens', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        console.error('Erro ao criar bucket:', createError);
        return NextResponse.json(
          { error: 'Erro ao criar bucket de imagens', details: createError.message },
          { status: 500 }
        );
      }

      // Configurar políticas públicas
      await supabaseAdmin.storage.from('imagens').createBucket('imagens', {
        public: true
      });
    }

    // Fazer upload para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('imagens')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      return NextResponse.json(
        { error: 'Erro ao fazer upload da imagem', details: uploadError.message },
        { status: 500 }
      );
    }

    // Obter URL pública da imagem
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('imagens')
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      path: filePath
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro ao processar upload', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
