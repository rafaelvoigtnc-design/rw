-- Alterar coluna fotos de TEXT[] para TEXT (JSON)
-- Isso resolve problemas com base64 longo em arrays
-- Execute no SQL Editor do Supabase

-- 1. Primeiro, fazer backup dos dados existentes (se houver)
CREATE TABLE IF NOT EXISTS brinquedo_backup AS SELECT * FROM brinquedo;

-- 2. Adicionar nova coluna fotos_json
ALTER TABLE brinquedo ADD COLUMN IF NOT EXISTS fotos_json TEXT;

-- 3. Converter dados existentes (se houver)
UPDATE brinquedo
SET fotos_json = COALESCE(fotos::TEXT, '[]'::TEXT)
WHERE fotos_json IS NULL;

-- 4. Remover coluna antiga (se desejar)
-- ALTER TABLE brinquedo DROP COLUMN IF EXISTS fotos;

-- 5. Renomear nova coluna para fotos
-- ALTER TABLE brinquedo RENAME COLUMN fotos_json TO fotos;

-- Alternativa mais segura: manter ambas e usar a nova no código
-- Vamos apenas adicionar fotos_json e usar no código

-- Verificar resultado
SELECT id, nome, fotos, fotos_json
FROM brinquedo
LIMIT 5;
