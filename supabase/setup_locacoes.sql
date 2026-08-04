-- SETUP COMPLETO PARA LOCAÇÕES
-- Execute este SQL no SQL Editor do Supabase

-- 1. Criar tabela cliente se não existir
CREATE TABLE IF NOT EXISTS cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE,
  senha_hash TEXT,
  endereco TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de locações
CREATE TABLE IF NOT EXISTS locacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
  data_evento DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  endereco TEXT NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  valor_sinal DECIMAL(10, 2) NOT NULL,
  status_pagamento VARCHAR(50) NOT NULL DEFAULT 'pendente',
  status_locacao VARCHAR(50) NOT NULL DEFAULT 'confirmada',
  cuidador_nome TEXT,
  cuidador_valor DECIMAL(10, 2),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de itens da locação
CREATE TABLE IF NOT EXISTS locacao_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locacao_id UUID NOT NULL REFERENCES locacao(id) ON DELETE CASCADE,
  brinquedo_id UUID NOT NULL REFERENCES brinquedo(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(locacao_id, brinquedo_id)
);

-- 4. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_locacao_data_evento ON locacao(data_evento);
CREATE INDEX IF NOT EXISTS idx_locacao_cliente_id ON locacao(cliente_id);
CREATE INDEX IF NOT EXISTS idx_locacao_status_locacao ON locacao(status_locacao);
CREATE INDEX IF NOT EXISTS idx_locacao_item_brinquedo_id ON locacao_item(brinquedo_id);
CREATE INDEX IF NOT EXISTS idx_locacao_item_locacao_id ON locacao_item(locacao_id);

-- 5. Habilitar RLS
ALTER TABLE cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE locacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE locacao_item ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS (permitir tudo - supabaseAdmin vai contornar RLS)
-- Para tabela cliente
CREATE POLICY IF NOT EXISTS "Permitir leitura completa de clientes" ON cliente
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Permitir inserção de clientes" ON cliente
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Permitir atualização de clientes" ON cliente
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Permitir exclusão de clientes" ON cliente
  FOR DELETE USING (true);

-- Para tabela locacao
CREATE POLICY IF NOT EXISTS "Permitir leitura completa de locações" ON locacao
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Permitir inserção de locações" ON locacao
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Permitir atualização de locações" ON locacao
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Permitir exclusão de locações" ON locacao
  FOR DELETE USING (true);

-- Para tabela locacao_item
CREATE POLICY IF NOT EXISTS "Permitir leitura completa de locacao_item" ON locacao_item
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Permitir inserção de locacao_item" ON locacao_item
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Permitir atualização de locacao_item" ON locacao_item
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Permitir exclusão de locacao_item" ON locacao_item
  FOR DELETE USING (true);
