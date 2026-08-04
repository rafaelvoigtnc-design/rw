import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Buscar locações que incluem este brinquedo no período
    const { data: locacoes, error } = await supabase
      .from('locacao_item')
      .select(`
        locacao_id,
        brinquedo_id,
        locacao (
          data_evento,
          horario_inicio,
          horario_fim
        )
      `)
      .eq('brinquedo_id', params.id)
      .gte('locacao.data_evento', inicio.toISOString().split('T')[0])
      .lte('locacao.data_evento', fim.toISOString().split('T')[0]);

    if (error) throw error;

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
    if (locacoes) {
      locacoes.forEach((item: any) => {
        const locacao = item.locacao;
        if (!locacao) return;

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
    }

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
