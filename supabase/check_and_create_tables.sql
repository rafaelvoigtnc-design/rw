-- Verificar e criar tabela cliente se não existir
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

-- Habilitar RLS
ALTER TABLE cliente ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cliente
CREATE POLICY IF NOT EXISTS "Permitir leitura completa de clientes" ON cliente
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Permitir inserção de clientes" ON cliente
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Permitir atualização de clientes" ON cliente
  FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Permitir exclusão de clientes" ON cliente
  FOR DELETE USING (true);
