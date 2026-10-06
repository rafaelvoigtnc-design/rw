import { NextResponse } from 'next/server';
import { getAllPromocoes } from '@/lib/firebase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const promocoes = await getAllPromocoes();

    // Filtrar apenas promoções ativas
    const promocoesAtivas = promocoes.filter((p: any) => p.ativa);

    // Adicionar cache para melhorar performance
    return NextResponse.json(promocoesAtivas, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
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
