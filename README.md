# RW Brinquedos

Sistema de locação de brinquedos infantis e itens de festa com parte pública (vitrine) e parte administrativa.

## Stack Tecnológica

- **Frontend**: Next.js 14 (React) com TypeScript
- **Backend**: API Routes do Next.js
- **Banco de Dados**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Estilização**: TailwindCSS

## Estrutura do Banco de Dados

O sistema possui as seguintes tabelas:

- **usuario_admin**: Administradores do sistema
- **cliente**: Clientes que realizam locações
- **categoria**: Categorias de brinquedos
- **brinquedo**: Catálogo de brinquedos disponíveis para locação
- **carrinho_item**: Itens no carrinho de compras
- **locacao**: Locações realizadas pelos clientes
- **locacao_item**: Itens de cada locação (tabela de ligação)
- **promocao**: Promoções e descontos
- **avaliacao**: Avaliações de clientes
- **favorito**: Brinquedos favoritos dos clientes
- **transacao_financeira**: Controle financeiro do sistema

## Configuração Inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie as credenciais do painel do Supabase:
   - Project URL
   - anon public key
4. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_projeto_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_supabase
DATABASE_URL=sua_string_de_conexao_postgresql
```

A `DATABASE_URL` pode ser obtida no painel do Supabase em Settings > Database > Connection String > URI.

### 3. Executar migrations do Prisma

```bash
npx prisma migrate dev --name init
```

Isso criará todas as tabelas no banco de dados PostgreSQL.

### 4. Gerar o Prisma Client

```bash
npx prisma generate
```

### 5. Executar o projeto em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o projeto rodando.

## Verificar Criação das Tabelas

Para conferir que as tabelas foram criadas corretamente, você pode:

### Via Prisma Studio (interface visual)

```bash
npx prisma studio
```

Isso abrirá uma interface visual no navegador onde você pode ver todas as tabelas e seus dados.

### Via SQL no Supabase

1. Acesse o painel do Supabase
2. Vá em SQL Editor
3. Execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver as seguintes tabelas:
- usuario_admin
- cliente
- categoria
- brinquedo
- carrinho_item
- locacao
- locacao_item
- promocao
- avaliacao
- favorito
- transacao_financeira

### Via Prisma CLI

```bash
npx prisma db pull
```

Depois verifique o arquivo `prisma/schema.prisma` para confirmar que reflete o schema esperado.

## Próximos Passos

- Criar telas da parte pública (vitrine)
- Criar telas da parte administrativa
- Implementar autenticação
- Implementar upload de imagens via Supabase Storage
- Criar API routes para CRUD das entidades
