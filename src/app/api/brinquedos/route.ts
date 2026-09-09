import { NextResponse } from 'next/server';
import { getBrinquedos } from '@/lib/firebase-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const faixaEtaria = searchParams.get('faixaEtaria') || undefined;
    const busca = searchParams.get('busca') || undefined;
    const ordenacao = searchParams.get('ordenacao') || 'nome';
    const destaqueHome = searchParams.get('destaqueHome');

    const brinquedos = await getBrinquedos({ faixaEtaria, busca, ordenacao });

    // Filtrar por destaque_home se solicitado
    let brinquedosFiltrados = brinquedos;
    if (destaqueHome === 'true') {
      brinquedosFiltrados = brinquedos.filter((b: any) => b.destaque_home === true);
    }

    // Temporariamente: não filtrar por status para debug
    // const brinquedosDisponiveis = brinquedosFiltrados.filter((b: any) => b.status === 'DISPONIVEL');

    return NextResponse.json(brinquedosFiltrados);
  } catch (error) {
    console.error('Erro ao buscar brinquedos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar brinquedos' },
      { status: 500 }
    );
  }
}
