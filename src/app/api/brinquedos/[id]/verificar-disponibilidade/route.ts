import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, horario_inicio, horario_fim } = await request.json();
    const brinquedoId = params.id;

    console.log('Verificando disponibilidade:', { brinquedoId, data, horario_inicio, horario_fim });

    if (!data || !horario_inicio || !horario_fim) {
      return NextResponse.json(
        { error: 'Data e horários são obrigatórios' },
        { status: 400 }
      );
    }

    // Converter strings para objetos Date
    const dataInicio = new Date(`${data}T${horario_inicio}`);
    const dataFim = new Date(`${data}T${horario_fim}`);

    console.log('Datas convertidas:', { dataInicio, dataFim });

    // Buscar locações confirmadas do brinquedo
    const locacoes = await prisma.locacao_item.findMany({
      where: {
        brinquedo_id: brinquedoId,
        locacao: {
          status: { in: ['confirmada', 'em_andamento'] },
        },
      },
      include: {
        locacao: true,
      },
    });

    console.log('Locações encontradas:', locacoes.length);

    // Verificar conflitos
    let temConflito = false;
    const conflitos: string[] = [];

    for (const item of locacoes) {
      const locInicio = new Date(item.locacao.data_evento + 'T' + item.locacao.horario_inicio);
      const locFim = new Date(item.locacao.data_evento + 'T' + item.locacao.horario_fim);

      console.log('Comparando:', { dataInicio, dataFim, locInicio, locFim });

      // Verificar se há sobreposição de horários
      if (
        dataInicio < locFim &&
        dataFim > locInicio
      ) {
        temConflito = true;
        conflitos.push(
          `Conflito com locação de ${item.locacao.data_evento} das ${item.locacao.horario_inicio} às ${item.locacao.horario_fim}`
        );
      }
    }

    console.log('Resultado:', { disponivel: !temConflito, conflitos });

    return NextResponse.json({
      disponivel: !temConflito,
      conflitos: temConflito ? conflitos : [],
    });
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar disponibilidade' },
      { status: 500 }
    );
  }
}
