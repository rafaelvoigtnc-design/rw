-- Criar tabela dados_empresa
CREATE TABLE IF NOT EXISTS dados_empresa (
  id TEXT PRIMARY KEY,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  inscricao_estadual TEXT,
  endereco TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  site TEXT,
  observacoes TEXT,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados da empresa (sempre terá apenas um registro)
INSERT INTO dados_empresa (id, razao_social, nome_fantasia, cnpj, inscricao_estadual, endereco, numero, complemento, bairro, cidade, estado, cep, telefone, email, site, observacoes, atualizado_em) VALUES
(
  'empresa_01',
  'RW Brinquedos Locações',
  'RW Brinquedos',
  '00.000.000/0001-00',
  'ISENTO',
  'Rua Principal',
  '123',
  'Sala 1',
  'Centro',
  'Nova Candelária',
  'RS',
  '99999-999',
  '(55) 99730-2463',
  'rwbrinquedos@gmail.com',
  'https://www.rwbrinquedos.com.br',
  'Empresa especializada em locação de brinquedos e itens para festas.',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  razao_social = EXCLUDED.razao_social,
  nome_fantasia = EXCLUDED.nome_fantasia,
  cnpj = EXCLUDED.cnpj,
  inscricao_estadual = EXCLUDED.inscricao_estadual,
  endereco = EXCLUDED.endereco,
  numero = EXCLUDED.numero,
  complemento = EXCLUDED.complemento,
  bairro = EXCLUDED.bairro,
  cidade = EXCLUDED.cidade,
  estado = EXCLUDED.estado,
  cep = EXCLUDED.cep,
  telefone = EXCLUDED.telefone,
  email = EXCLUDED.email,
  site = EXCLUDED.site,
  observacoes = EXCLUDED.observacoes,
  atualizado_em = NOW();
