-- ============================================================================
-- CORRIGIR COLUNA FOTOS DE TEXT[] PARA TEXT (JSON)
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- 1. Verificar tipo atual da coluna fotos
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'brinquedo' AND column_name = 'fotos';

-- 2. Mudar fotos de TEXT[] para TEXT
DO $$
BEGIN
  -- Backup dos dados existentes
  CREATE TABLE IF NOT EXISTS brinquedo_fotos_backup AS SELECT id, fotos FROM brinquedo WHERE fotos IS NOT NULL;

  -- Alterar tipo de TEXT[] para TEXT
  ALTER TABLE brinquedo ALTER COLUMN fotos TYPE TEXT USING fotos::TEXT;

  RAISE NOTICE 'Coluna fotos alterada de TEXT[] para TEXT com sucesso';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao alterar coluna: %', SQLERRM;
END $$;

-- 3. Verificar resultado
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'brinquedo' AND column_name = 'fotos';
