import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filtro = searchParams.get('filtro') || 'todas';

    console.log('Filtro solicitado:', filtro);

    // Buscar todas as avaliações primeiro
    const q = query(collection(db, 'avaliacoes'), orderBy('criado_em', 'desc'));
    const snapshot = await getDocs(q);
    
    let avaliacoes = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
      const avaliacao = { id: docSnapshot.id, ...docSnapshot.data() };
      
      // Buscar dados do cliente
      if (avaliacao.cliente_id) {
        const clienteDoc = await getDoc(doc(db, 'clientes', avaliacao.cliente_id));
        if (clienteDoc.exists()) {
          avaliacao.cliente = clienteDoc.data();
        }
      }
      
      // Buscar dados do brinquedo
      if (avaliacao.brinquedo_id) {
        const brinquedoDoc = await getDoc(doc(db, 'brinquedos', avaliacao.brinquedo_id));
        if (brinquedoDoc.exists()) {
          avaliacao.brinquedo = brinquedoDoc.data();
        }
      }
      
      return avaliacao;
    }));

    console.log('Total de avaliações antes do filtro:', avaliacoes.length);

    // Aplicar filtros no frontend
    if (filtro === 'pendentes') {
      avaliacoes = avaliacoes.filter((a: any) => !a.aprovado_para_exibir && !a.recusada);
    } else if (filtro === 'aprovadas') {
      avaliacoes = avaliacoes.filter((a: any) => a.aprovado_para_exibir);
    } else if (filtro === 'recusadas') {
      avaliacoes = avaliacoes.filter((a: any) => a.recusada);
    } else if (filtro === 'brinquedos') {
      avaliacoes = avaliacoes.filter((a: any) => a.brinquedo_id);
    } else if (filtro === 'depoimentos') {
      avaliacoes = avaliacoes.filter((a: any) => !a.brinquedo_id);
    }

    console.log('Total de avaliações após filtro:', avaliacoes.length);

    return NextResponse.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, aprovado } = await request.json();

    console.log('Atualizando avaliação:', id, 'aprovado:', aprovado);

    const docRef = doc(db, 'avaliacoes', id);
    await updateDoc(docRef, { 
      aprovado_para_exibir: aprovado,
      recusada: !aprovado
    });

    console.log('Avaliação atualizada com sucesso');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar avaliação' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    console.log('Excluindo avaliação:', id);

    const docRef = doc(db, 'avaliacoes', id);
    await deleteDoc(docRef);

    console.log('Avaliação excluída com sucesso');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir avaliação:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir avaliação' },
      { status: 500 }
    );
  }
}
