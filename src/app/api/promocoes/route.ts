import { NextResponse } from 'next/server';
import { getAllPromocoes } from '@/lib/firebase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const promocoes = await getAllPromocoes();
    
    console.log('Todas as promoções recebidas:', promocoes);
    
    // Filtrar apenas promoções ativas (sem filtrar por período por enquanto para debug)
    const promocoesAtivas = promocoes.filter((p: any) => {
      const isAtiva = p.ativa;
      console.log(`Promoção ${p.titulo}: ativa=${isAtiva}`);
      return isAtiva;
    });

    console.log('Promoções ativas filtradas:', promocoesAtivas);

    // Adicionar headers para evitar cache
    return NextResponse.json(promocoesAtivas, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar promoções' },
      { status: 500 }
    );
  }
}
