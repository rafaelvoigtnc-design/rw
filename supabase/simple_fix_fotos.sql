-- Solução simples: mudar fotos de TEXT[] para TEXT (JSON string)
-- Execute no SQL Editor do Supabase

-- Verificar estrutura atual
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'brinquedo' AND column_name = 'fotos';

-- Se fotos for TEXT[], mudar para TEXT
DO $$
BEGIN
  -- Verificar tipo atual
  DECLARE
    col_type TEXT;
  BEGIN
    SELECT data_type INTO col_type
    FROM information_schema.columns
    WHERE table_name = 'brinquedo' AND column_name = 'fotos';

    IF col_type = 'ARRAY' THEN
      -- Backup dos dados
      CREATE TABLE IF NOT EXISTS brinquedo_fotos_backup AS SELECT id, fotos FROM brinquedo WHERE fotos IS NOT NULL;

      -- Mudar tipo para TEXT
      ALTER TABLE brinquedo ALTER COLUMN fotos TYPE TEXT USING fotos::TEXT;

      RAISE NOTICE 'Coluna fotos alterada de ARRAY para TEXT';
    ELSE
      RAISE NOTICE 'Coluna fotos já é do tipo %', col_type;
    END IF;
  END;
END $$;

-- Verificar resultado
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'brinquedo' AND column_name = 'fotos';
