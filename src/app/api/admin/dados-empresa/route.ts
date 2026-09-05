import { NextResponse } from 'next/server';
import { getDocs, collection, query, where, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  try {
    const q = query(collection(db, 'dados_empresa'), where('id', '==', 'empresa_01'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Criar registro padrão se não existir
      const docRef = await addDoc(collection(db, 'dados_empresa'), {
        id: 'empresa_01',
        razao_social: '',
        nome_fantasia: 'RW Brinquedos',
        cnpj: '',
        inscricao_estadual: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
        site: '',
        observacoes: '',
        atualizado_em: new Date().toISOString(),
      });
      const docSnap = await getDoc(docRef);
      return NextResponse.json({ id: docRef.id, ...docSnap.data() });
    }

    return NextResponse.json({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
  } catch (error) {
    console.error('Erro ao buscar dados da empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados da empresa' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verificar se já existe um registro
    const q = query(collection(db, 'dados_empresa'), where('id', '==', 'empresa_01'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Atualizar existente
      const docRef = doc(db, 'dados_empresa', snapshot.docs[0].id);
      await updateDoc(docRef, {
        ...body,
        atualizado_em: new Date().toISOString(),
      });
      const docSnap = await getDoc(docRef);
      return NextResponse.json({ id: docRef.id, ...docSnap.data() });
    }

    // Criar novo
    const docRef = await addDoc(collection(db, 'dados_empresa'), {
      id: 'empresa_01',
      ...body,
      atualizado_em: new Date().toISOString(),
    });
    const docSnap = await getDoc(docRef);
    return NextResponse.json({ id: docRef.id, ...docSnap.data() });
  } catch (error) {
    console.error('Erro ao salvar dados da empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar dados da empresa' },
      { status: 500 }
    );
  }
}
