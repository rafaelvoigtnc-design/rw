-- ============================================================================
-- EXECUTE ESTE SQL NO SUPABASE SQL EDITOR
-- ============================================================================
-- 1. Vá para https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. No menu lateral, clique em "SQL Editor"
-- 4. Clique em "New query"
-- 5. Copie todo este conteúdo abaixo
-- 6. Cole no SQL Editor
-- 7. Clique em "Run" (ou "Execute")
-- ============================================================================

-- Criar tabela cliente
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

-- Criar tabela brinquedo
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

-- Criar tabela banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  subtitulo VARCHAR(255),
  descricao TEXT,
  botao_primario VARCHAR(100),
  link_primario TEXT,
  botao_secundario VARCHAR(100),
  link_secundario TEXT,
  gradiente VARCHAR(255),
  imagem TEXT,
  badge VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela conteudo_pagina
CREATE TABLE IF NOT EXISTS conteudo_pagina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pagina VARCHAR(100) NOT NULL UNIQUE,
  secao VARCHAR(100) NOT NULL,
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela avaliacao
CREATE TABLE IF NOT EXISTS avaliacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES cliente(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  foto TEXT,
  aprovado_para_exibir BOOLEAN DEFAULT false,
  exibir_no_home BOOLEAN DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela dados_empresa
CREATE TABLE IF NOT EXISTS dados_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela contratos
CREATE TABLE IF NOT EXISTS contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela transacao_financeira
CREATE TABLE IF NOT EXISTS transacao_financeira (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10, 2) NOT NULL,
  data DATE NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_brinquedo_status ON brinquedo(status);
CREATE INDEX IF NOT EXISTS idx_brinquedo_faixa_etaria ON brinquedo(faixa_etaria);
CREATE INDEX IF NOT EXISTS idx_locacao_data_evento ON locacao(data_evento);
CREATE INDEX IF NOT EXISTS idx_locacao_cliente_id ON locacao(cliente_id);
CREATE INDEX IF NOT EXISTS idx_locacao_status_locacao ON locacao(status_locacao);
CREATE INDEX IF NOT EXISTS idx_locacao_item_brinquedo_id ON locacao_item(brinquedo_id);
CREATE INDEX IF NOT EXISTS idx_locacao_item_locacao_id ON locacao_item(locacao_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_cliente_id ON avaliacao(cliente_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_aprovado ON avaliacao(aprovado_para_exibir);

-- Habilitar RLS em todas as tabelas
ALTER TABLE cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE brinquedo ENABLE ROW LEVEL SECURITY;
ALTER TABLE locacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE locacao_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE conteudo_pagina ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacao_financeira ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura completa de clientes" ON cliente;
DROP POLICY IF EXISTS "Permitir inserção de clientes" ON cliente;
DROP POLICY IF EXISTS "Permitir atualização de clientes" ON cliente;
DROP POLICY IF EXISTS "Permitir exclusão de clientes" ON cliente;

DROP POLICY IF EXISTS "Permitir leitura completa de brinquedos" ON brinquedo;
DROP POLICY IF EXISTS "Permitir inserção de brinquedos" ON brinquedo;
DROP POLICY IF EXISTS "Permitir atualização de brinquedos" ON brinquedo;
DROP POLICY IF EXISTS "Permitir exclusão de brinquedos" ON brinquedo;

DROP POLICY IF EXISTS "Permitir leitura completa de locações" ON locacao;
DROP POLICY IF EXISTS "Permitir inserção de locações" ON locacao;
DROP POLICY IF EXISTS "Permitir atualização de locações" ON locacao;
DROP POLICY IF EXISTS "Permitir exclusão de locações" ON locacao;

DROP POLICY IF EXISTS "Permitir leitura completa de locacao_item" ON locacao_item;
DROP POLICY IF EXISTS "Permitir inserção de locacao_item" ON locacao_item;
DROP POLICY IF EXISTS "Permitir atualização de locacao_item" ON locacao_item;
DROP POLICY IF EXISTS "Permitir exclusão de locacao_item" ON locacao_item;

DROP POLICY IF EXISTS "Permitir leitura completa de banners" ON banners;
DROP POLICY IF EXISTS "Permitir inserção de banners" ON banners;
DROP POLICY IF EXISTS "Permitir atualização de banners" ON banners;
DROP POLICY IF EXISTS "Permitir exclusão de banners" ON banners;

DROP POLICY IF EXISTS "Permitir leitura completa de conteudo_pagina" ON conteudo_pagina;
DROP POLICY IF EXISTS "Permitir inserção de conteudo_pagina" ON conteudo_pagina;
DROP POLICY IF EXISTS "Permitir atualização de conteudo_pagina" ON conteudo_pagina;
DROP POLICY IF EXISTS "Permitir exclusão de conteudo_pagina" ON conteudo_pagina;

DROP POLICY IF EXISTS "Permitir leitura completa de avaliacao" ON avaliacao;
DROP POLICY IF EXISTS "Permitir inserção de avaliacao" ON avaliacao;
DROP POLICY IF EXISTS "Permitir atualização de avaliacao" ON avaliacao;
DROP POLICY IF EXISTS "Permitir exclusão de avaliacao" ON avaliacao;

DROP POLICY IF EXISTS "Permitir leitura completa de dados_empresa" ON dados_empresa;
DROP POLICY IF EXISTS "Permitir inserção de dados_empresa" ON dados_empresa;
DROP POLICY IF EXISTS "Permitir atualização de dados_empresa" ON dados_empresa;
DROP POLICY IF EXISTS "Permitir exclusão de dados_empresa" ON dados_empresa;

DROP POLICY IF EXISTS "Permitir leitura completa de contratos" ON contratos;
DROP POLICY IF EXISTS "Permitir inserção de contratos" ON contratos;
DROP POLICY IF EXISTS "Permitir atualização de contratos" ON contratos;
DROP POLICY IF EXISTS "Permitir exclusão de contratos" ON contratos;

DROP POLICY IF EXISTS "Permitir leitura completa de transacao_financeira" ON transacao_financeira;
DROP POLICY IF EXISTS "Permitir inserção de transacao_financeira" ON transacao_financeira;
DROP POLICY IF EXISTS "Permitir atualização de transacao_financeira" ON transacao_financeira;
DROP POLICY IF EXISTS "Permitir exclusão de transacao_financeira" ON transacao_financeira;

-- Criar novas políticas RLS (permitir tudo)
CREATE POLICY "Permitir leitura completa de clientes" ON cliente FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de clientes" ON cliente FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de clientes" ON cliente FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de clientes" ON cliente FOR DELETE USING (true);

CREATE POLICY "Permitir leitura completa de brinquedos" ON brinquedo FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de brinquedos" ON brinquedo FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de brinquedos" ON brinquedo FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de brinquedos" ON brinquedo FOR DELETE USING (true);

CREATE POLICY "Permitir leitura completa de locações" ON locacao FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de locações" ON locacao FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de locações" ON locacao FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de locações" ON locacao FOR DELETE USING (true);

CREATE POLICY "Permitir leitura completa de locacao_item" ON locacao_item FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de locacao_item" ON locacao_item FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de locacao_item" ON locacao_item FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de locacao_item" ON locacao_item FOR DELETE USING (true);

CREATE POLICY "Permitir leitura completa de banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de banners" ON banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de banners" ON banners FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de banners" ON banners FOR DELETE USING (true);

CREATE POLICY "Permitir leitura completa de conteudo_pagina" ON conteudo_pagina FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de conteudo_pagina" ON conteudo_pagina FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de conteudo_pagina" ON conteudo_pagina FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de conteudo_pagina" ON conteudo_pagina FOR DELETE USING (true);

CREATE POLICY "Permitir leitura completa de avaliacao" ON avaliacao FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de avaliacao" ON avaliacao FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de avaliacao" ON avaliacao FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de avaliacao" ON avaliacao FOR DELETE USING (true);

CREATE POLICY "Permitir leitura completa de dados_empresa" ON dados_empresa FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de dados_empresa" ON dados_empresa FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de dados_empresa" ON dados_empresa FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de dados_empresa" ON dados_empresa FOR DELETE USING (true);

CREATE POLICY "Permitir leitura completa de contratos" ON contratos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de contratos" ON contratos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de contratos" ON contratos FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de contratos" ON contratos FOR DELETE USING (true);

CREATE POLICY "Permitir leitura completa de transacao_financeira" ON transacao_financeira FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de transacao_financeira" ON transacao_financeira FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de transacao_financeira" ON transacao_financeira FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de transacao_financeira" ON transacao_financeira FOR DELETE USING (true);

-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
