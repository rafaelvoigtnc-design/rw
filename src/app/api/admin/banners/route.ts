import { NextResponse } from 'next/server';
import { getAllBanners, createBanner } from '@/lib/firebase-db';

export async function GET(request: Request) {
  try {
    console.log('Buscando banners do Firebase (admin)...');
    const banners = await getAllBanners();

    // Ordenar por ordem
    banners.sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));
    
    console.log(`Retornando ${banners.length} banners (admin)`);
    return NextResponse.json(banners, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar banners (admin):', error);
    return NextResponse.json(
      { error: 'Erro ao buscar banners', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Buscar maior ordem atual
    const banners = await getAllBanners();
    const novaOrdem = banners.length > 0 ? Math.max(...banners.map((b: any) => b.ordem || 0)) + 1 : 0;

    const data = await createBanner({
      ...body,
      ordem: body.ordem !== undefined ? body.ordem : novaOrdem,
    });

    return NextResponse.json({ id: data.id, ...body, ordem: body.ordem !== undefined ? body.ordem : novaOrdem });
  } catch (error) {
    console.error('Erro ao criar banner:', error);
    return NextResponse.json(
      { error: 'Erro ao criar banner' },
      { status: 500 }
    );
  }
}
