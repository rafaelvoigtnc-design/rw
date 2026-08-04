-- Adicionar campo exibir_no_home na tabela avaliacao
ALTER TABLE avaliacao ADD COLUMN IF NOT EXISTS exibir_no_home BOOLEAN DEFAULT FALSE;

-- Criar índice para filtrar avaliações do home
CREATE INDEX IF NOT EXISTS idx_avaliacoes_exibir_home ON avaliacao(exibir_no_home, aprovado_para_exibir);
