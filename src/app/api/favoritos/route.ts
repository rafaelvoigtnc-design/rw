import { NextResponse } from 'next/server';
import { getFavoritos, toggleFavorito } from '@/lib/firebase-db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.match(/client_token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const clienteId = payload.id;

    const favoritos = await getFavoritos(clienteId);

    return NextResponse.json(favoritos);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar favoritos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.match(/client_token=([^;]+)/)?.[1];
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const clienteId = payload.id;

    const { brinquedoId } = await request.json();

    const result = await toggleFavorito(clienteId, brinquedoId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao gerenciar favorito:', error);
    return NextResponse.json(
      { error: 'Erro ao gerenciar favorito' },
      { status: 500 }
    );
  }
}
