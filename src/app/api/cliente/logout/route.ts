import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Remover cookie de sessão
  response.cookies.delete('cliente_token', { path: '/' });

  return response;
}
