import { NextResponse } from 'next/server';
import { getLocacoes, createLocacao, createLocacaoItem, createTransacao, createCliente, getClienteById } from '@/lib/firebase-db';

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
    const locacoes = await getLocacoes();
    return NextResponse.json(locacoes);
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
      local_evento,
      brinquedos,
      valor_total,
      valor_sinal,
      status_pagamento,
      status_locacao,
      cuidador_nome,
      cuidador_valor,
      observacoes,
    } = await request.json();

    console.log('Dados recebidos:', { cliente_id, cliente_novo, data_evento, horario_inicio, horario_fim, brinquedos });

    // Se for cliente novo, cadastrar primeiro
    let finalClienteId = cliente_id;
    if (cliente_novo && (cliente_novo.nome || cliente_novo.telefone)) {
      const novoCliente = await createCliente({
        id: crypto.randomUUID(),
        nome: cliente_novo.nome,
        telefone: cliente_novo.telefone,
        email: cliente_novo.email,
        senha_hash: '', // Será definido depois
        endereco: cliente_novo.endereco,
      });
      finalClienteId = novoCliente.id;
    }

    // Simplificado: Não verificar conflitos por enquanto (Firestore não suporta queries complexas como Supabase)
    // TODO: Implementar verificação de conflitos quando possível

    // Criar locação
    console.log('Criando locação com cliente_id:', finalClienteId);
    
    // Buscar nome do cliente para salvar na locação
    let clienteNome = '';
    if (finalClienteId) {
      const cliente = await getClienteById(finalClienteId);
      clienteNome = cliente?.nome || '';
    } else if (cliente_novo?.nome) {
      clienteNome = cliente_novo.nome;
    }
    
    const locacao = await createLocacao({
      cliente_id: finalClienteId,
      cliente_nome: clienteNome, // Salvar nome do cliente para evitar problema de busca
      data_evento,
      horario_inicio,
      horario_fim,
      endereco,
      local_evento,
      valor_total,
      sinal_pago: valor_sinal || 0,
      status_pagamento: status_pagamento || 'PENDENTE',
      status_locacao: status_locacao || 'ORCAMENTO',
      cuidador_nome: cuidador_nome || null,
      cuidador_valor: cuidador_valor || null,
      observacoes: observacoes || null,
    });

    console.log('Locação criada com sucesso:', locacao.id);

    // Criar itens da locação
    if (brinquedos && brinquedos.length > 0) {
      for (const brinquedo of brinquedos) {
        await createLocacaoItem({
          locacao_id: locacao.id,
          brinquedo_id: brinquedo.brinquedo_id,
        });
      }
    }

    // Gerar transação financeira automaticamente se pago ou parcial
    if (status_pagamento === 'pago' || status_pagamento === 'parcial') {
      const valorTransacao = valor_total - (cuidador_valor || 0);

      await createTransacao({
        tipo: 'ENTRADA_LOCACAO',
        valor: valorTransacao,
        data: new Date().toISOString().split('T')[0],
        descricao: `Locação #${locacao.id}`,
        locacao_id: locacao.id,
      });
    }

    return NextResponse.json({ id: locacao.id, ...locacao });
  } catch (error) {
    console.error('Erro ao criar locação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar locação', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
