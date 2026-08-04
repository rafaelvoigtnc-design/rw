-- Criar tabela de locações
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

-- Criar tabela de itens da locação
CREATE TABLE IF NOT EXISTS locacao_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locacao_id UUID NOT NULL REFERENCES locacao(id) ON DELETE CASCADE,
  brinquedo_id UUID NOT NULL REFERENCES brinquedo(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(locacao_id, brinquedo_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_locacao_data_evento ON locacao(data_evento);
CREATE INDEX IF NOT EXISTS idx_locacao_cliente_id ON locacao(cliente_id);
CREATE INDEX IF NOT EXISTS idx_locacao_status_locacao ON locacao(status_locacao);
CREATE INDEX IF NOT EXISTS idx_locacao_item_brinquedo_id ON locacao_item(brinquedo_id);
CREATE INDEX IF NOT EXISTS idx_locacao_item_locacao_id ON locacao_item(locacao_id);

-- Habilitar RLS
ALTER TABLE locacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE locacao_item ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para locacao (permitir tudo para o admin via service role)
-- O service role vai contornar RLS, então não precisamos de políticas específicas
-- Mas se quiser usar client role, adicione as políticas abaixo:

-- Políticas para locacao (opcional, se usar client role)
CREATE POLICY IF NOT EXISTS "Permitir leitura completa de locações" ON locacao
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Permitir inserção de locações" ON locacao
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Permitir atualização de locações" ON locacao
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Permitir exclusão de locações" ON locacao
  FOR DELETE USING (true);

-- Políticas para locacao_item (opcional, se usar client role)
CREATE POLICY IF NOT EXISTS "Permitir leitura completa de locacao_item" ON locacao_item
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Permitir inserção de locacao_item" ON locacao_item
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Permitir atualização de locacao_item" ON locacao_item
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Permitir exclusão de locacao_item" ON locacao_item
  FOR DELETE USING (true);
