import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Proteger rotas /admin exceto /admin/login
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = await verifyToken(token);
    if (!payload || payload.type !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Redirecionar /admin/login para /admin se já estiver logado
  if (path === '/admin/login') {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.type === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  // Proteger rotas /cliente exceto /cliente/login e /cliente/registro
  if (path.startsWith('/cliente') && path !== '/cliente/login' && path !== '/cliente/registro') {
    const token = request.cookies.get('client_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/cliente/login', request.url));
    }

    const payload = await verifyToken(token);
    if (!payload || payload.type !== 'client') {
      return NextResponse.redirect(new URL('/cliente/login', request.url));
    }
  }

  // Redirecionar /cliente/login para /catalogo se já estiver logado
  if (path === '/cliente/login') {
    const token = request.cookies.get('client_token')?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.type === 'client') {
        return NextResponse.redirect(new URL('/catalogo', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/cliente/:path*'],
};
