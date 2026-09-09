import { NextResponse } from 'next/server';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar cliente
    const clienteDoc = await getDoc(doc(db, 'clientes', id));
    if (!clienteDoc.exists()) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    const cliente = { id: clienteDoc.id, ...clienteDoc.data() };

    // Buscar carrinho do cliente
    const carrinhoQuery = query(collection(db, 'carrinho'), where('cliente_id', '==', id));
    const carrinhoSnapshot = await getDocs(carrinhoQuery);
    const carrinho = carrinhoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Buscar favoritos do cliente
    const favoritosQuery = query(collection(db, 'favoritos'), where('cliente_id', '==', id));
    const favoritosSnapshot = await getDocs(favoritosQuery);
    const favoritos = favoritosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Buscar locações do cliente
    const locacoesQuery = query(collection(db, 'locacoes'), where('cliente_id', '==', id));
    const locacoesSnapshot = await getDocs(locacoesQuery);
    const locacoes = locacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Para cada locação, buscar os itens
    for (const locacao of locacoes) {
      const itensQuery = query(collection(db, 'locacao_itens'), where('locacao_id', '==', locacao.id));
      const itensSnapshot = await getDocs(itensQuery);
      locacao.locacao_item = itensSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return NextResponse.json({
      cliente,
      carrinho,
      favoritos,
      locacoes
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes do cliente' },
      { status: 500 }
    );
  }
}
