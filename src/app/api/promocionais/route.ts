import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'promocionais'));
    const promocionais = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filtrar apenas ativos e não expirados
    const agora = new Date();
    const promocionaisAtivos = promocionais.filter((p: any) => {
      const dataFim = new Date(p.data_fim);
      return p.ativo && dataFim >= agora;
    });

    return NextResponse.json(promocionaisAtivos, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar promocionais:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar promocionais' },
      { status: 500 }
    );
  }
}
