import { NextResponse } from 'next/server';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  try {
    // Contar brinquedos
    const brinquedosSnapshot = await getDocs(collection(db, 'brinquedos'));
    const brinquedosCount = brinquedosSnapshot.size;

    // Contar locações
    const locacoesSnapshot = await getDocs(collection(db, 'locacoes'));
    const locacoesCount = locacoesSnapshot.size;

    // Contar clientes
    const clientesSnapshot = await getDocs(collection(db, 'clientes'));
    const clientesCount = clientesSnapshot.size;

    // Calcular faturamento (soma dos valores das locações)
    let faturamentoTotal = 0;
    locacoesSnapshot.forEach(doc => {
      const valor = doc.data().valor_total;
      if (valor) {
        faturamentoTotal += valor;
      }
    });

    return NextResponse.json({
      brinquedos: brinquedosCount,
      locacoes: locacoesCount,
      clientes: clientesCount,
      faturamento: faturamentoTotal,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
