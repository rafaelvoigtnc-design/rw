import { NextResponse } from 'next/server';
import { doc, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { cliente_id, cliente_nome, dados_participacao } = body;

    if (!cliente_id || !cliente_nome || !dados_participacao) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: cliente_id, cliente_nome, dados_participacao' },
        { status: 400 }
      );
    }

    // Verificar se promocional existe e está ativo
    const promocionalRef = doc(db, 'promocionais', params.id);
    const promocionalSnap = await getDoc(promocionalRef);

    if (!promocionalSnap.exists()) {
      return NextResponse.json(
        { error: 'Promocional não encontrado' },
        { status: 404 }
      );
    }

    const promocional = promocionalSnap.data();
    const agora = new Date();
    const dataFim = new Date(promocional.data_fim);

    // Comparar datas em UTC para evitar problemas de fuso horário
    const agoraUTC = new Date(agora.toISOString());
    const dataFimUTC = new Date(dataFim.toISOString());

    if (!promocional.ativo || dataFimUTC < agoraUTC) {
      return NextResponse.json(
        { error: 'Promocional não está mais ativo' },
        { status: 400 }
      );
    }

    // Verificar se cliente já participou
    const q = query(
      collection(db, 'participacoes_promocional'),
      where('promocional_id', '==', params.id),
      where('cliente_id', '==', cliente_id)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return NextResponse.json(
        { error: 'Você já está participando deste promocional' },
        { status: 400 }
      );
    }

    // Criar participação
    const docRef = await addDoc(collection(db, 'participacoes_promocional'), {
      promocional_id: params.id,
      cliente_id,
      cliente_nome,
      dados_participacao,
      data_participacao: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id, ...body });
  } catch (error) {
    console.error('Erro ao participar:', error);
    return NextResponse.json(
      { error: 'Erro ao participar' },
      { status: 500 }
    );
  }
}
