# Teste de Conexão no Navegador

## Passo 1: Abra o console do navegador

1. Acesse seu site (ou http://localhost:3001 se estiver rodando localmente)
2. Pressione F12 para abrir as ferramentas de desenvolvedor
3. Vá para a aba "Console"

## Passo 2: Execute este código no console

```javascript
// Teste de conexão com Supabase
fetch('/api/admin/brinquedos')
  .then(res => res.json())
  .then(data => console.log('✅ API brinquedos funcionando:', data))
  .catch(err => console.error('❌ Erro na API brinquedos:', err));

// Teste de inserção
fetch('/api/admin/brinquedos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Teste Console',
    descricao: 'Teste de conexão',
    fotos: [],
    tema_layout: 'classico_divertido',
    dimensoes: '3x3m',
    faixa_etaria: '3-5 anos',
    status: 'DISPONIVEL'
  })
})
  .then(res => res.json())
  .then(data => console.log('✅ Inserção funcionando:', data))
  .catch(err => console.error('❌ Erro na inserção:', err));
```

## Passo 3: Verifique o que aparece no console

- Se aparecer "✅ API brinquedos funcionando", a conexão está OK
- Se aparecer "❌ Erro na API brinquedos", copie o erro e me mande
- Se aparecer "❌ Erro na inserção", copie o erro e me mande

## Passo 4: Tente salvar um brinquedo no admin

1. Vá para a página de brinquedos no admin
2. Preencha o formulário
3. Clique em salvar
4. Olhe o console do navegador
5. Copie todos os logs que aparecem (especialmente os com vermelho)

## Me mande:

1. O resultado do teste no console
2. Os logs que aparecem ao tentar salvar um brinquedo
3. Qualquer erro que apareça (mensagem completa)
