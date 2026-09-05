import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json();

    console.log('Tentativa de login:', email);

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // O login é feito diretamente no cliente usando Firebase Auth
    // Esta API route não é mais necessária para o login
    return NextResponse.json(
      { error: 'Use Firebase Auth diretamente no cliente' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro no login cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
