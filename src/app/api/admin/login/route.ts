import { NextRequest, NextResponse } from 'next/server';
import { getAdminByEmail, createAdminRecord } from '@/lib/supabase';
import { verifyPassword, createAdminToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se existe admin
    let admin = await getAdminByEmail(email);

    // Se não existe admin e é o email configurado, criar seed
    if (!admin && email === process.env.ADMIN_EMAIL) {
      const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123');
      admin = await createAdminRecord({
        id: crypto.randomUUID(),
        nome: 'Administrador',
        email: process.env.ADMIN_EMAIL,
        senha_hash: hashedPassword,
        criado_em: new Date().toISOString()
      });
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar senha
    const isValid = await verifyPassword(password, admin.senha_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Criar token
    const token = await createAdminToken(admin.id);

    // Retornar token em cookie
    const response = NextResponse.json(
      { success: true, admin: { id: admin.id, nome: admin.nome, email: admin.email } },
      { status: 200 }
    );

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    });

    return response;
  } catch (error) {
    console.error('Erro no login admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
