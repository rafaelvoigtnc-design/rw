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

    // Buscar carrinho do cliente (com tratamento de erro)
    let carrinho = [];
    try {
      const carrinhoQuery = query(collection(db, 'carrinho'), where('cliente_id', '==', id));
      const carrinhoSnapshot = await getDocs(carrinhoQuery);
      carrinho = carrinhoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
    }

    // Buscar favoritos do cliente (com tratamento de erro)
    let favoritos = [];
    try {
      const favoritosQuery = query(collection(db, 'favoritos'), where('cliente_id', '==', id));
      const favoritosSnapshot = await getDocs(favoritosQuery);
      favoritos = favoritosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    }

    // Buscar locações do cliente (com tratamento de erro)
    let locacoes = [];
    try {
      const locacoesQuery = query(collection(db, 'locacoes'), where('cliente_id', '==', id));
      const locacoesSnapshot = await getDocs(locacoesQuery);
      locacoes = locacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Para cada locação, buscar os itens
      for (const locacao of locacoes) {
        try {
          const itensQuery = query(collection(db, 'locacao_itens'), where('locacao_id', '==', locacao.id));
          const itensSnapshot = await getDocs(itensQuery);
          locacao.locacao_item = itensSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error('Erro ao buscar itens da locação:', error);
          locacao.locacao_item = [];
        }
      }
    } catch (error) {
      console.error('Erro ao buscar locações:', error);
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
