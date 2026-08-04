-- Verificar e corrigir a coluna fotos da tabela brinquedo
-- Execute no SQL Editor do Supabase

-- Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'brinquedo'
ORDER BY ordinal_position;

-- Se a coluna fotos não existe ou está com tipo errado, recriar
-- Primeiro, vamos mudar fotos para TEXT para aceitar base64 (se estiver como array)

DO $$
BEGIN
  -- Verificar se a coluna existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brinquedo' AND column_name = 'fotos'
  ) THEN
    -- Alterar para TEXT[] se já não for
    -- Se já estiver como TEXT[], não precisa mudar
    RAISE NOTICE 'Coluna fotos já existe';
  ELSE
    -- Adicionar coluna
    ALTER TABLE brinquedo ADD COLUMN fotos TEXT[];
    RAISE NOTICE 'Coluna fotos adicionada como TEXT[]';
  END IF;
END $$;

-- Alternativa: usar TEXT (string simples) em vez de array
-- Isso pode resolver problemas com base64 longo
DO $$
BEGIN
  -- Verificar se podemos alterar para TEXT simples
  -- Se o array estiver causando problemas, podemos mudar para JSONB ou TEXT simples
  RAISE NOTICE 'Se estiver tendo problemas com array de fotos, considere mudar para TEXT (JSON) ou JSONB';
END $$;

-- Teste: inserir um brinquedo de teste
-- Descomente as linhas abaixo para testar
/*
INSERT INTO brinquedo (nome, descricao, fotos, tema_layout, dimensoes, faixa_etaria, status)
VALUES (
  'Teste',
  'Brinquedo de teste',
  ARRAY['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='],
  'classico_divertido',
  '3x3m',
  '3-5 anos',
  'DISPONIVEL'
);
*/

-- Selecionar para verificar
SELECT * FROM brinquedo LIMIT 1;
