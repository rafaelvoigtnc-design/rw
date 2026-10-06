import { NextResponse } from 'next/server';
import { getLocacoes } from '@/lib/firebase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Buscar locações com itens para calendário (mostrar nomes dos brinquedos)
    const locacoes = await getLocacoes(true);
    return NextResponse.json(locacoes, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
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
