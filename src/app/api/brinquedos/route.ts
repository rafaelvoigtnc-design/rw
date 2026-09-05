import { NextResponse } from 'next/server';
import { getBrinquedos } from '@/lib/firebase-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const faixaEtaria = searchParams.get('faixaEtaria');
    const busca = searchParams.get('busca');
    const ordenacao = searchParams.get('ordenacao') || 'nome';

    const brinquedos = await getBrinquedos({ faixaEtaria, busca, ordenacao });

    // Temporariamente: não filtrar por status para debug
    // const brinquedosDisponiveis = brinquedos.filter((b: any) => b.status === 'DISPONIVEL');

    return NextResponse.json(brinquedos);
  } catch (error) {
    console.error('Erro ao buscar brinquedos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar brinquedos' },
      { status: 500 }
    );
  }
}
