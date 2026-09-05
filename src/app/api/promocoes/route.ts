import { NextResponse } from 'next/server';
import { getAllPromocoes } from '@/lib/firebase-db';

export async function GET() {
  try {
    const promocoes = await getAllPromocoes();
    
    console.log('Todas as promoções recebidas:', promocoes);
    
    // Filtrar promoções ativas no período atual
    const now = new Date().toISOString();
    const promocoesAtivas = promocoes.filter((p: any) => {
      const isAtiva = p.ativa;
      const isNoPeriodo = p.data_inicio && p.data_fim && p.data_inicio <= now && p.data_fim >= now;
      const isIndeterminada = !p.data_fim || p.data_fim === '';
      
      console.log(`Promoção ${p.titulo}: ativa=${isAtiva}, noPeriodo=${isNoPeriodo}, indeterminada=${isIndeterminada}`);
      console.log(`  data_inicio: ${p.data_inicio}, data_fim: ${p.data_fim}`);
      console.log(`  now: ${now}`);
      
      return isAtiva && (isNoPeriodo || isIndeterminada);
    });

    console.log('Promoções ativas filtradas:', promocoesAtivas);

    return NextResponse.json(promocoesAtivas);
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar promoções' },
      { status: 500 }
    );
  }
}
