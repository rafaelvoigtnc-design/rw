import { NextResponse } from 'next/server';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    console.log('Buscando clientes no Firebase...');
    const snapshot = await getDocs(collection(db, 'clientes'));
    const clientes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Encontrados ${clientes.length} clientes no Firebase`);
    console.log('Clientes:', clientes.map(c => ({ id: c.id, nome: c.nome, email: c.email })));
    
    return NextResponse.json(clientes, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, telefone, email, endereco, senha_hash } = body;

    console.log('POST recebido:', body);

    // Apenas nome é obrigatório
    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Se email for fornecido, verificar se já existe
    if (email && email.trim() !== '') {
      const q = query(collection(db, 'clientes'), where('email', '==', email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 400 }
        );
      }
    }

    const docRef = await addDoc(collection(db, 'clientes'), {
      nome,
      telefone: telefone || '',
      email: email || '',
      endereco: endereco || '',
      cidade: '',
      senha_hash: senha_hash || '',
      origem_cadastro: 'admin',
      criado_em: new Date().toISOString()
    });

    return NextResponse.json({ id: docRef.id, nome, telefone, email, endereco });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nome, telefone, email, endereco, senha_hash } = body;

    console.log('PUT recebido:', body);

    if (!id) {
      return NextResponse.json(
        { error: 'ID não fornecido' },
        { status: 400 }
      );
    }

    console.log('Atualizando cliente ID:', id, 'com dados:', body);

    const docRef = doc(db, 'clientes', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('Cliente não encontrado para atualização:', id);
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (nome !== undefined) updateData.nome = nome;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (email !== undefined) updateData.email = email;
    if (endereco !== undefined) updateData.endereco = endereco;
    if (senha_hash !== undefined) updateData.senha_hash = senha_hash;

    console.log('Dados de atualização:', updateData);

    await updateDoc(docRef, updateData);

    console.log('Cliente atualizado com sucesso');
    return NextResponse.json({ id, ...updateData });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID não fornecido' },
        { status: 400 }
      );
    }

    const docRef = doc(db, 'clientes', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o cliente tem locações
    const locacoesQuery = query(collection(db, 'locacoes'), where('cliente_id', '==', id));
    const locacoesSnapshot = await getDocs(locacoesQuery);
    
    if (!locacoesSnapshot.empty) {
      return NextResponse.json(
        { error: 'Não é possível excluir cliente com locações associadas' },
        { status: 400 }
      );
    }

    await deleteDoc(docRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar cliente' },
      { status: 500 }
    );
  }
}
