import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Removendo toda proteção de middleware para simplificar
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/cliente/:path*'],
};
