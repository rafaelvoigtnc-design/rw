import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', request.url));
  }

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Erro ao trocar código por sessão:', error);
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }

    if (!data.user || !data.session) {
      return NextResponse.redirect(new URL('/?error=no_session', request.url));
    }

    // Verificar se o cliente já existe
    const { data: existingClient } = await supabase
      .from('cliente')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();

    if (existingClient) {
      // Cliente já existe, fazer login
      const response = NextResponse.redirect(new URL('/cliente/perfil', request.url));
      
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    // Cliente não existe, redirecionar para completar cadastro
    const response = NextResponse.redirect(new URL('/completar-cadastro', request.url));
    
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('google_auth_user_id', data.user.id, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hora para completar cadastro
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    return NextResponse.redirect(new URL('/?error=server_error', request.url));
  }
}
