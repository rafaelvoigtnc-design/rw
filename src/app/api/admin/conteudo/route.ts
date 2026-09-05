import { NextResponse } from 'next/server';
import { getDocs, collection, query, where, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pagina = searchParams.get('pagina');

    let q = collection(db, 'conteudo_pagina');

    if (pagina) {
      q = query(q, where('pagina', '==', pagina));
    }

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar conteúdo' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pagina = formData.get('pagina') as string;
    const chave = formData.get('chave') as string;
    const valor = formData.get('valor') as string;
    const tipo = formData.get('tipo') as string;
    const arquivo = formData.get('arquivo') as File | null;

    let finalValor = valor;

    // Se for upload de arquivo, salvar no servidor local
    if (arquivo && tipo === 'imagem') {
      const bytes = await arquivo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Criar diretório de uploads se não existir
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'conteudo', pagina);
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Gerar nome único do arquivo
      const timestamp = Date.now();
      const extensao = arquivo.name.split('.').pop();
      const fileName = `${chave}_${timestamp}.${extensao}`;
      const filePath = path.join(uploadDir, fileName);

      // Salvar arquivo
      await writeFile(filePath, buffer);

      // Retornar URL relativa
      finalValor = `/uploads/conteudo/${pagina}/${fileName}`;
      console.log('Imagem salva no servidor:', finalValor);
    }

    // Verificar se já existe um conteúdo com a mesma página e chave
    const q = query(
      collection(db, 'conteudo_pagina'),
      where('pagina', '==', pagina),
      where('chave', '==', chave)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Atualizar existente
      const docRef = doc(db, 'conteudo_pagina', snapshot.docs[0].id);
      await updateDoc(docRef, {
        valor: finalValor,
        tipo,
        atualizado_em: new Date().toISOString(),
      });
      const docSnap = await getDoc(docRef);
      console.log('Conteúdo atualizado:', docSnap.id);
      return NextResponse.json({ id: docRef.id, ...docSnap.data() });
    } else {
      // Criar novo
      const docRef = await addDoc(collection(db, 'conteudo_pagina'), {
        pagina,
        chave,
        valor: finalValor,
        tipo,
        atualizado_em: new Date().toISOString(),
      });
      const docSnap = await getDoc(docRef);
      console.log('Conteúdo criado:', docSnap.id);
      return NextResponse.json({ id: docRef.id, ...docSnap.data() });
    }
  } catch (error) {
    console.error('Erro ao salvar conteúdo:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar conteúdo: ' + error },
      { status: 500 }
    );
  }
}
