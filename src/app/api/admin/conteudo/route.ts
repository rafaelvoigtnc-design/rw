import { NextResponse } from 'next/server';
import { getDocs, collection, query, where, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    console.log('Iniciando POST de conteúdo...');
    const formData = await request.formData();
    console.log('FormData recebido');

    const pagina = formData.get('pagina') as string;
    const chave = formData.get('chave') as string;
    const valor = formData.get('valor') as string;
    const tipo = formData.get('tipo') as string;
    const arquivo = formData.get('arquivo') as File | null;

    console.log('Dados recebidos:', { pagina, chave, tipo, hasFile: !!arquivo });

    let finalValor = valor;

    // Se for upload de arquivo, salvar no Firebase Storage
    if (arquivo && tipo === 'imagem') {
      console.log('Iniciando upload de arquivo para Firebase Storage...');
      console.log('Nome do arquivo:', arquivo.name);
      console.log('Tamanho do arquivo:', arquivo.size);

      const bytes = await arquivo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Gerar nome único do arquivo
      const timestamp = Date.now();
      const extensao = arquivo.name.split('.').pop();
      const fileName = `${chave}_${timestamp}.${extensao}`;
      const storagePath = `conteudo/${pagina}/${fileName}`;

      // Fazer upload para Firebase Storage
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, buffer);
      console.log('Arquivo enviado para Firebase Storage');

      // Obter URL de download
      finalValor = await getDownloadURL(storageRef);
      console.log('URL obtida:', finalValor);
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
    console.error('Detalhes do erro:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Erro ao salvar conteúdo: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
