-- Criar tabela contratos
CREATE TABLE IF NOT EXISTS contratos (
  id TEXT PRIMARY KEY,
  locacao_id TEXT NOT NULL,
  
  -- Dados do cliente
  cliente_nome TEXT NOT NULL,
  cliente_cpf TEXT NOT NULL,
  cliente_rg TEXT,
  cliente_nascimento DATE,
  cliente_endereco TEXT NOT NULL,
  cliente_numero TEXT NOT NULL,
  cliente_complemento TEXT,
  cliente_bairro TEXT NOT NULL,
  cliente_cidade TEXT NOT NULL,
  cliente_estado TEXT NOT NULL,
  cliente_cep TEXT NOT NULL,
  cliente_telefone TEXT NOT NULL,
  cliente_email TEXT,
  
  -- Dados do contrato
  data_contrato TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_evento DATE NOT NULL,
  horario_inicio TEXT NOT NULL,
  horario_fim TEXT NOT NULL,
  local_evento TEXT NOT NULL,
  valor_total NUMERIC NOT NULL,
  valor_sinal NUMERIC DEFAULT 0,
  forma_pagamento TEXT NOT NULL,
  
  -- Cláusulas personalizadas
  clausulas_adicionais TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'RASCUNHO', -- RASCUNHO, PENDENTE_ASSINATURA, ASSINADO, CANCELADO
  
  -- Assinaturas
  cliente_assinou BOOLEAN DEFAULT FALSE,
  data_assinatura_cliente TIMESTAMP WITH TIME ZONE,
  empresa_assinou BOOLEAN DEFAULT FALSE,
  data_assinatura_empresa TIMESTAMP WITH TIME ZONE,
  
  -- Observações
  observacoes TEXT,
  
  -- Timestamps
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT contratos_locacao_fkey FOREIGN KEY (locacao_id) REFERENCES locacao(id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_contratos_locacao ON contratos(locacao_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status);
CREATE INDEX IF NOT EXISTS idx_contratos_data_evento ON contratos(data_evento);
