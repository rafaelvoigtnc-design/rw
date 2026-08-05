# Verificar Variáveis de Ambiente

## Verifique se as seguintes variáveis estão no seu arquivo .env

O arquivo `.env` deve estar na raiz do projeto: `C:\Projeto\RW\rw-brinquedos\.env`

### Variáveis necessárias:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
```

### Onde encontrar essas chaves:

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em "Settings" → "API"
4. Copie:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role key → SUPABASE_SERVICE_ROLE_KEY

### Importante:

- A `SUPABASE_SERVICE_ROLE_KEY` é necessária para usar `supabaseAdmin`
- Sem ela, as APIs não funcionarão corretamente
- Nunca compartilhe a service_role key publicamente
