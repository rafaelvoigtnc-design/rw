import { NextResponse } from 'next/server';
import { getAvaliacoes, createAvaliacao } from '@/lib/firebase-db';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brinquedoId = searchParams.get('brinquedo_id');
    const tipo = searchParams.get('tipo'); // 'depoimentos' ou 'brinquedos'

    let avaliacoes = await getAvaliacoes();

    // Se tiver brinquedo_id, filtrar por ele
    if (brinquedoId) {
      avaliacoes = avaliacoes.filter((a: any) => a.brinquedo_id === brinquedoId);
    }
    
    // Se tiver tipo, filtrar por tipo
    if (tipo === 'depoimentos') {
      avaliacoes = avaliacoes.filter((a: any) => !a.brinquedo_id);
    } else if (tipo === 'brinquedos') {
      avaliacoes = avaliacoes.filter((a: any) => a.brinquedo_id);
    }

    // Buscar dados dos clientes
    const avaliacoesComClientes = await Promise.all(avaliacoes.map(async (avaliacao: any) => {
      if (avaliacao.cliente_id) {
        const clienteDoc = await getDoc(doc(db, 'clientes', avaliacao.cliente_id));
        if (clienteDoc.exists()) {
          avaliacao.cliente = clienteDoc.data();
        }
      }
      return avaliacao;
    }));

    return NextResponse.json(avaliacoesComClientes);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { texto, nota, brinquedo_id, foto } = await request.json();

    console.log('Dados recebidos para avaliação:', { texto, nota, brinquedo_id, foto });

    // Verificar se há token de autenticação do Firebase
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('Token não encontrado');
      return NextResponse.json(
        { error: 'Você precisa estar logado para deixar um depoimento' },
        { status: 401 }
      );
    }

    // Decodificar o token para obter UID
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        );
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const clienteId = payload.user_id || payload.uid;
      
      if (!clienteId) {
        return NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        );
      }

      console.log('Cliente ID:', clienteId);

      // Criar avaliação
      const avaliacaoData = {
        cliente_id: clienteId,
        texto: String(texto),
        nota: Number(nota),
        brinquedo_id: brinquedo_id || null,
        foto: foto || null,
        aprovado_para_exibir: false,
      };

      console.log('Dados para inserir:', avaliacaoData);

      const data = await createAvaliacao(avaliacaoData);

      console.log('Avaliação criada com sucesso:', data);
      return NextResponse.json({ id: data.id, ...avaliacaoData });
    } catch (decodeError) {
      console.error('Erro ao decodificar token:', decodeError);
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar avaliação', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
