-- Adicionar campo mostrar_home na tabela brinquedo
ALTER TABLE brinquedo 
ADD COLUMN mostrar_home BOOLEAN DEFAULT false;

-- Atualizar brinquedos existentes para não mostrar na home por padrão
UPDATE brinquedo SET mostrar_home = false WHERE mostrar_home IS NULL;
