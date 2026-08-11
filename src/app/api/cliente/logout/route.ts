import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Remover cookies de sessão
  response.cookies.delete('sb-access-token', { path: '/' });
  response.cookies.delete('sb-refresh-token', { path: '/' });

  return response;
}
