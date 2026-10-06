import { NextResponse } from 'next/server';
import { getAllPromocoes } from '@/lib/firebase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const promocoes = await getAllPromocoes();

    // Filtrar apenas promoções ativas
    const promocoesAtivas = promocoes.filter((p: any) => p.ativa);

    // Sem cache para atualização imediata
    return NextResponse.json(promocoesAtivas, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
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
