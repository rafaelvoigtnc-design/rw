-- Verificar e corrigir tabela brinquedo
-- Execute no SQL Editor do Supabase

-- Verificar se a tabela existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'brinquedo') THEN
    RAISE NOTICE 'Tabela brinquedo não existe. Criando...';
  ELSE
    RAISE NOTICE 'Tabela brinquedo existe.';
  END IF;
END $$;

-- Criar ou atualizar tabela brinquedo
CREATE TABLE IF NOT EXISTS brinquedo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  fotos TEXT[], -- Array de texto para armazenar URLs/base64
  tema_layout VARCHAR(100) DEFAULT 'classico_divertido',
  dimensoes VARCHAR(100),
  faixa_etaria VARCHAR(50),
  status VARCHAR(50) DEFAULT 'DISPONIVEL',
  avaliacao_media DECIMAL(3, 2),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna fotos se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brinquedo' AND column_name = 'fotos'
  ) THEN
    ALTER TABLE brinquedo ADD COLUMN fotos TEXT[];
    RAISE NOTICE 'Coluna fotos adicionada.';
  ELSE
    RAISE NOTICE 'Coluna fotos já existe.';
  END IF;
END $$;

-- Adicionar coluna tema_layout se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brinquedo' AND column_name = 'tema_layout'
  ) THEN
    ALTER TABLE brinquedo ADD COLUMN tema_layout VARCHAR(100) DEFAULT 'classico_divertido';
    RAISE NOTICE 'Coluna tema_layout adicionada.';
  ELSE
    RAISE NOTICE 'Coluna tema_layout já existe.';
  END IF;
END $$;

-- Adicionar coluna dimensoes se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brinquedo' AND column_name = 'dimensoes'
  ) THEN
    ALTER TABLE brinquedo ADD COLUMN dimensoes VARCHAR(100);
    RAISE NOTICE 'Coluna dimensoes adicionada.';
  ELSE
    RAISE NOTICE 'Coluna dimensoes já existe.';
  END IF;
END $$;

-- Adicionar coluna faixa_etaria se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brinquedo' AND column_name = 'faixa_etaria'
  ) THEN
    ALTER TABLE brinquedo ADD COLUMN faixa_etaria VARCHAR(50);
    RAISE NOTICE 'Coluna faixa_etaria adicionada.';
  ELSE
    RAISE NOTICE 'Coluna faixa_etaria já existe.';
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE brinquedo ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura completa de brinquedos" ON brinquedo;
DROP POLICY IF EXISTS "Permitir inserção de brinquedos" ON brinquedo;
DROP POLICY IF EXISTS "Permitir atualização de brinquedos" ON brinquedo;
DROP POLICY IF EXISTS "Permitir exclusão de brinquedos" ON brinquedo;

-- Criar novas políticas
CREATE POLICY "Permitir leitura completa de brinquedos" ON brinquedo
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de brinquedos" ON brinquedo
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de brinquedos" ON brinquedo
  FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de brinquedos" ON brinquedo
  FOR DELETE USING (true);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_brinquedo_status ON brinquedo(status);
CREATE INDEX IF NOT EXISTS idx_brinquedo_faixa_etaria ON brinquedo(faixa_etaria);

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'brinquedo'
ORDER BY ordinal_position;
