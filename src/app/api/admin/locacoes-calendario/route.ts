import { NextResponse } from 'next/server';
import { getLocacoes } from '@/lib/firebase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Buscar locações sem itens para calendário (mais rápido)
    const locacoes = await getLocacoes(false);
    return NextResponse.json(locacoes, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=15',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar locações para calendário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar locações' },
      { status: 500 }
    );
  }
}
