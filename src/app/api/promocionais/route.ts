import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'promocionais'));
    const promocionais = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filtrar apenas ativos e não expirados
    const agora = new Date();
    agora.setHours(0, 0, 0, 0); // Zerar hora para comparação correta
    const promocionaisAtivos = promocionais.filter((p: any) => {
      const dataFim = new Date(p.data_fim);
      dataFim.setHours(23, 59, 59, 999); // Final do dia
      return p.ativo && dataFim >= agora;
    });

    return NextResponse.json(promocionaisAtivos, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
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
