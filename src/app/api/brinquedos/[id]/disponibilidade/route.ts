import { NextResponse } from 'next/server';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    // Se não especificado, busca os próximos 7 dias
    const hoje = new Date();
    const inicio = dataInicio ? new Date(dataInicio) : hoje;
    const fim = dataFim ? new Date(dataFim) : new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Buscar locações no período
    const locacoesQuery = query(
      collection(db, 'locacoes'),
      where('data_evento', '>=', inicio.toISOString().split('T')[0]),
      where('data_evento', '<=', fim.toISOString().split('T')[0])
    );
    const locacoesSnapshot = await getDocs(locacoesQuery);
    const locacoes = locacoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Buscar itens de locação que incluem este brinquedo
    const itensQuery = query(
      collection(db, 'locacao_itens'),
      where('brinquedo_id', '==', params.id)
    );
    const itensSnapshot = await getDocs(itensQuery);
    const itens = itensSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filtrar locações que têm este brinquedo
    const locacoesBrinquedo = locacoes.filter(locacao =>
      itens.some(item => item.locacao_id === locacao.id)
    );

    // Formatar disponibilidade por data e horário
    const disponibilidade: Record<string, Record<string, boolean>> = {};

    // Inicializar todos os dias e horários como livres
    const dias = [];
    const dataAtual = new Date(inicio);
    while (dataAtual <= fim) {
      const dataStr = dataAtual.toISOString().split('T')[0];
      dias.push(dataStr);
      disponibilidade[dataStr] = {};

      // Horários de 8h às 20h em intervalos de 1 hora
      for (let hora = 8; hora <= 20; hora++) {
        const horarioStr = `${hora.toString().padStart(2, '0')}:00`;
        disponibilidade[dataStr][horarioStr] = true; // true = livre
      }

      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    // Marcar horários ocupados
    locacoesBrinquedo.forEach((locacao: any) => {
      const dataStr = locacao.data_evento;
      const inicioHora = parseInt(locacao.horario_inicio.split(':')[0]);
      const fimHora = parseInt(locacao.horario_fim.split(':')[0]);

      if (disponibilidade[dataStr]) {
        for (let hora = inicioHora; hora < fimHora; hora++) {
          const horarioStr = `${hora.toString().padStart(2, '0')}:00`;
          if (disponibilidade[dataStr][horarioStr] !== undefined) {
            disponibilidade[dataStr][horarioStr] = false; // false = ocupado
          }
        }
      }
    });

    return NextResponse.json({
      dias,
      disponibilidade
    });
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar disponibilidade' },
      { status: 500 }
    );
  }
}
