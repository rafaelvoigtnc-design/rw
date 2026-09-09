import { NextRequest, NextResponse } from 'next/server';
import { getAdminByEmail, createAdminRecord } from '@/lib/firebase-admin';
import { verifyPassword, createAdminToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 Tentativa de login:', email);
    console.log('🔑 ADMIN_EMAIL configurado:', process.env.ADMIN_EMAIL);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se existe admin
    let admin = await getAdminByEmail(email);
    console.log('👤 Admin encontrado:', !!admin);

    // Se não existe admin e é o email configurado, criar seed
    if (!admin && email === process.env.ADMIN_EMAIL) {
      console.log('🆔 Criando admin seed...');
      const hashedPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123');
      admin = await createAdminRecord({
        id: crypto.randomUUID(),
        nome: 'Administrador',
        email: process.env.ADMIN_EMAIL,
        senha_hash: hashedPassword,
        criado_em: new Date().toISOString()
      });
      console.log('✅ Admin criado:', admin);
    }

    if (!admin) {
      console.log('❌ Admin não encontrado');
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar senha
    console.log('🔒 Verificando senha...');
    const isValid = await verifyPassword(password, admin.senha_hash);
    console.log('✅ Senha válida:', isValid);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Criar token
    const token = await createAdminToken(admin.id);
    console.log('🎟️ Token criado');

    // Retornar token no corpo da resposta (para usar localStorage)
    const response = NextResponse.json(
      { 
        success: true, 
        token: token,
        admin: { id: admin.id, nome: admin.nome, email: admin.email } 
      },
      { status: 200 }
    );

    console.log('✅ Login realizado com sucesso');
    return response;
  } catch (error) {
    console.error('❌ Erro no login admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
