-- Criar tabelas do banco de dados RW Brinquedos

-- Tabela usuario_admin
CREATE TABLE usuario_admin (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela cliente
CREATE TABLE cliente (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    endereco TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MIGRAÇÃO: Para tabelas existentes com auth_id, execute:
-- ALTER TABLE cliente DROP COLUMN IF EXISTS auth_id;

-- Tabela categoria
CREATE TABLE categoria (
    id TEXT PRIMARY KEY,
    nome TEXT UNIQUE NOT NULL,
    icone TEXT
);

-- Tabela brinquedo
CREATE TABLE brinquedo (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria_id TEXT NOT NULL,
    descricao TEXT NOT NULL,
    fotos TEXT[] NOT NULL,
    dimensoes TEXT NOT NULL,
    faixa_etaria TEXT NOT NULL,
    preco_periodo NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'DISPONIVEL',
    tema_layout TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT brinquedo_categoria_fkey FOREIGN KEY (categoria_id) REFERENCES categoria(id)
);

-- Tabela carrinho_item
CREATE TABLE carrinho_item (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    brinquedo_id TEXT NOT NULL,
    data_adicionado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT carrinho_item_cliente_fkey FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    CONSTRAINT carrinho_item_brinquedo_fkey FOREIGN KEY (brinquedo_id) REFERENCES brinquedo(id)
);

-- Tabela locacao
CREATE TABLE locacao (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    data_evento TIMESTAMP NOT NULL,
    horario_inicio TEXT NOT NULL,
    horario_fim TEXT NOT NULL,
    endereco TEXT NOT NULL,
    valor_total NUMERIC NOT NULL,
    sinal_pago NUMERIC DEFAULT 0,
    status_pagamento TEXT NOT NULL DEFAULT 'PENDENTE',
    status_locacao TEXT NOT NULL DEFAULT 'ORCAMENTO',
    cuidador_nome TEXT,
    cuidador_valor NUMERIC,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT locacao_cliente_fkey FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);

-- Tabela locacao_item
CREATE TABLE locacao_item (
    id TEXT PRIMARY KEY,
    locacao_id TEXT NOT NULL,
    brinquedo_id TEXT NOT NULL,
    CONSTRAINT locacao_item_locacao_fkey FOREIGN KEY (locacao_id) REFERENCES locacao(id),
    CONSTRAINT locacao_item_brinquedo_fkey FOREIGN KEY (brinquedo_id) REFERENCES brinquedo(id)
);

-- Tabela promocao
CREATE TABLE promocao (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    ativa BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela avaliacao
CREATE TABLE avaliacao (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    brinquedo_id TEXT,
    texto TEXT NOT NULL,
    nota INTEGER NOT NULL,
    foto TEXT,
    aprovado_para_exibir BOOLEAN DEFAULT false,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT avaliacao_cliente_fkey FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    CONSTRAINT avaliacao_brinquedo_fkey FOREIGN KEY (brinquedo_id) REFERENCES brinquedo(id)
);

-- Tabela favorito
CREATE TABLE favorito (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    brinquedo_id TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT favorito_cliente_fkey FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    CONSTRAINT favorito_brinquedo_fkey FOREIGN KEY (brinquedo_id) REFERENCES brinquedo(id),
    CONSTRAINT favorito_cliente_brinquedo_unique UNIQUE (cliente_id, brinquedo_id)
);

-- Tabela transacao_financeira
CREATE TABLE transacao_financeira (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descricao TEXT NOT NULL,
    locacao_id TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT transacao_financeira_locacao_fkey FOREIGN KEY (locacao_id) REFERENCES locacao(id)
);
