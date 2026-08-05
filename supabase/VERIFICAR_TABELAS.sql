-- ============================================================================
-- VERIFICAR SE AS TABELAS EXISTEM E ESTÃO FUNCIONANDO
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- 1. Listar todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar estrutura da tabela brinquedo
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'brinquedo'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela cliente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cliente'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela locacao
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'locacao'
ORDER BY ordinal_position;

-- 5. Verificar RLS status
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('brinquedo', 'cliente', 'locacao')
ORDER BY tablename, policyname;

-- 6. Testar inserção simples (descomente para testar)
/*
INSERT INTO brinquedo (nome, descricao, fotos, tema_layout, dimensoes, faixa_etaria, status)
VALUES (
  'Teste SQL',
  'Teste de inserção via SQL',
  '[]',
  'classico_divertido',
  '3x3m',
  '3-5 anos',
  'DISPONIVEL'
);
*/
