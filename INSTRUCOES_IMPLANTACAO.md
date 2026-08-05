# Instruções para Implantação na Vercel

## Passo 1: Executar SQL no Supabase

Antes de implantar, você precisa executar este comando no painel do Supabase:

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Cole e execute:

```sql
ALTER TABLE brinquedo ADD COLUMN IF NOT EXISTS mostrar_home BOOLEAN DEFAULT false;
```

## Passo 2: Implantar na Vercel

As alterações já estão prontas. Para implantar:

### Opção A: Deploy Automático (Recomendado)

1. Faça commit das alterações no seu repositório Git
2. A Vercel fará o deploy automaticamente

### Opção B: Deploy Manual via Vercel CLI

1. Instale a Vercel CLI (se não tiver):
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

## Passo 3: Verificar Bucket de Imagens

O sistema criará automaticamente o bucket "imagens" no Supabase Storage, mas você pode verificar:

1. No painel do Supabase
2. Clique em "Storage" no menu lateral
3. Verifique se existe um bucket chamado "imagens"
4. Se não existir, crie manualmente:
   - Nome: imagens
   - Public: SIM
   - File size limit: 10MB

## O que foi alterado:

✅ Sistema de upload de imagens (sem URL)
✅ Campo "mostrar_home" para selecionar brinquedos da home
✅ Dashboard atualizado com contador de brinquedos ativos
✅ Home mostra apenas brinquedos marcados
✅ Catálogo mostra todos os brinquedos
✅ Upload direto do PC/telefone para Supabase Storage
✅ Tamanho máximo de imagem: 10MB
✅ Preview de imagens no admin
✅ Deleção automática de imagens ao deletar brinquedo

## Após o Deploy

1. Acesse o painel admin
2. Clique em "Gestão de Brinquedos"
3. Clique em "+ Novo Brinquedo"
4. Faça upload das imagens do seu PC/telefone
5. Marque "Mostrar na Home" se quiser que apareça na página inicial
6. Preencha os demais dados e salve
