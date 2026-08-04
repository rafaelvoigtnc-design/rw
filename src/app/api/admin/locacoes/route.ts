import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Função para verificar conflito de horários
function verificarConflito(horaInicio1: string, horaFim1: string, horaInicio2: string, horaFim2: string): boolean {
  const inicio1 = parseInt(horaInicio1.split(':')[0]);
  const fim1 = parseInt(horaFim1.split(':')[0]);
  const inicio2 = parseInt(horaInicio2.split(':')[0]);
  const fim2 = parseInt(horaFim2.split(':')[0]);

  // Verifica se há sobreposição
  return inicio1 < fim2 && fim1 > inicio2;
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('locacao')
      .select(`
        *,
        cliente (
          nome,
          telefone
        ),
        locacao_item (
          id,
          brinquedo_id,
          brinquedo (
            nome
          )
        )
      `)
      .order('data_evento', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar locações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar locações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      cliente_id,
      cliente_novo,
      data_evento,
      horario_inicio,
      horario_fim,
      endereco,
      brinquedos,
      valor_total,
      valor_sinal,
      status_pagamento,
      status_locacao,
      cuidador_nome,
      cuidador_valor,
      observacoes,
    } = await request.json();

    // Se for cliente novo, cadastrar primeiro
    let finalClienteId = cliente_id;
    if (cliente_novo) {
      const { data: novoCliente, error: clienteError } = await supabaseAdmin
        .from('cliente')
        .insert({
          id: crypto.randomUUID(),
          nome: cliente_novo.nome,
          telefone: cliente_novo.telefone,
          email: cliente_novo.email,
          senha_hash: '', // Será definido depois
          endereco: cliente_novo.endereco,
        })
        .select()
        .single();

      if (clienteError) throw clienteError;
      finalClienteId = novoCliente.id;
    }

    // Verificar conflitos para cada brinquedo
    const conflitos: Array<{ brinquedo: string; locacaoExistente: string }> = [];

    for (const brinquedo of brinquedos) {
      const { data: locacoesExistentes } = await supabaseAdmin
        .from('locacao_item')
        .select(`
          locacao_id,
          brinquedo_id,
          locacao (
            data_evento,
            horario_inicio,
            horario_fim,
            id
          )
        `)
        .eq('brinquedo_id', brinquedo.brinquedo_id)
        .eq('locacao.data_evento', data_evento);

      if (locacoesExistentes) {
        for (const item of locacoesExistentes) {
          const locacao = item.locacao as any;
          if (locacao) {
            const temConflito = verificarConflito(
              horario_inicio,
              horario_fim,
              locacao.horario_inicio,
              locacao.horario_fim
            );

            if (temConflito) {
              conflitos.push({
                brinquedo: brinquedo.nome,
                locacaoExistente: `Locação #${item.locacao_id} das ${locacao.horario_inicio} às ${locacao.horario_fim}`,
              });
            }
          }
        }
      }
    }

    if (conflitos.length > 0) {
      return NextResponse.json(
        {
          error: 'Conflito de horários detectado',
          conflitos,
        },
        { status: 409 }
      );
    }

    // Criar locação
    const { data: locacao, error: locacaoError } = await supabaseAdmin
      .from('locacao')
      .insert({
        id: crypto.randomUUID(),
        cliente_id: finalClienteId,
        data_evento,
        horario_inicio,
        horario_fim,
        endereco,
        valor_total,
        valor_sinal,
        status_pagamento,
        status_locacao,
        cuidador_nome: cuidador_nome || null,
        cuidador_valor: cuidador_valor || null,
        observacoes: observacoes || null,
      })
      .select()
      .single();

    if (locacaoError) throw locacaoError;

    // Criar itens da locação
    for (const brinquedo of brinquedos) {
      await supabaseAdmin.from('locacao_item').insert({
        id: crypto.randomUUID(),
        locacao_id: locacao.id,
        brinquedo_id: brinquedo.brinquedo_id,
      });
    }

    // Gerar transação financeira automaticamente se pago ou parcial
    if (status_pagamento === 'pago' || status_pagamento === 'parcial') {
      const valorTransacao = valor_total - (cuidador_valor || 0);

      await supabaseAdmin.from('transacao_financeira').insert({
        id: crypto.randomUUID(),
        tipo: 'entrada_locacao',
        valor: valorTransacao,
        data: new Date().toISOString().split('T')[0],
        descricao: `Locação #${locacao.id}`,
        locacao_id: locacao.id,
      });
    }

    return NextResponse.json(locacao);
  } catch (error) {
    console.error('Erro ao criar locação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar locação' },
      { status: 500 }
    );
  }
}
