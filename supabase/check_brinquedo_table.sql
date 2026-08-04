-- Verificar e criar tabela brinquedo se não existir
CREATE TABLE IF NOT EXISTS brinquedo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  fotos TEXT[],
  tema_layout VARCHAR(100) DEFAULT 'classico_divertido',
  dimensoes VARCHAR(100),
  faixa_etaria VARCHAR(50),
  status VARCHAR(50) DEFAULT 'DISPONIVEL',
  avaliacao_media DECIMAL(3, 2),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE brinquedo ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para brinquedo
CREATE POLICY IF NOT EXISTS "Permitir leitura completa de brinquedos" ON brinquedo
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Permitir inserção de brinquedos" ON brinquedo
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Permitir atualização de brinquedos" ON brinquedo
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Permitir exclusão de brinquedos" ON brinquedo
  FOR DELETE USING (true);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_brinquedo_status ON brinquedo(status);
CREATE INDEX IF NOT EXISTS idx_brinquedo_faixa_etaria ON brinquedo(faixa_etaria);
