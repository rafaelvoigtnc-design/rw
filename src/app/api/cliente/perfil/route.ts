import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('client_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar token e obter cliente_id
    const payload = await verifyToken(token);
    if (!payload || payload.type !== 'client') {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const cliente = await prisma.cliente.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true,
        endereco: true,
      },
    });

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('client_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.type !== 'client') {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();
    const { nome, telefone, email, endereco } = body;

    // Validar telefone
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      return NextResponse.json({ error: 'O telefone deve ter exatamente 11 dígitos' }, { status: 400 });
    }

    // Verificar se o email já está em uso por outro cliente
    const clienteExistente = await prisma.cliente.findFirst({
      where: {
        email: email,
        id: { not: payload.id },
      },
    });

    if (clienteExistente) {
      return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 });
    }

    // Atualizar cliente
    const cliente = await prisma.cliente.update({
      where: {
        id: payload.id,
      },
      data: {
        nome,
        telefone: telefoneLimpo,
        email,
        endereco,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
