// Teste de conexão com Supabase
// Execute: node test_db_connection.js

const { createClient } = require('@supabase/supabase-js');

// Pegue as credenciais do seu .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'SUA_URL_AQUI';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'SUA_KEY_AQUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testando conexão com Supabase...');
  console.log('URL:', supabaseUrl);

  try {
    // Testar se as tabelas existem
    console.log('\n1. Verificando tabela brinquedo...');
    const { data: brinquedos, error: brinquedoError } = await supabase
      .from('brinquedo')
      .select('*')
      .limit(1);

    if (brinquedoError) {
      console.error('Erro na tabela brinquedo:', brinquedoError);
    } else {
      console.log('✅ Tabela brinquedo OK');
      console.log('Total brinquedos:', brinquedos?.length || 0);
    }

    console.log('\n2. Verificando tabela cliente...');
    const { data: clientes, error: clienteError } = await supabase
      .from('cliente')
      .select('*')
      .limit(1);

    if (clienteError) {
      console.error('Erro na tabela cliente:', clienteError);
    } else {
      console.log('✅ Tabela cliente OK');
      console.log('Total clientes:', clientes?.length || 0);
    }

    console.log('\n3. Verificando tabela locacao...');
    const { data: locacoes, error: locacaoError } = await supabase
      .from('locacao')
      .select('*')
      .limit(1);

    if (locacaoError) {
      console.error('Erro na tabela locacao:', locacaoError);
    } else {
      console.log('✅ Tabela locacao OK');
      console.log('Total locações:', locacoes?.length || 0);
    }

    console.log('\n4. Testando inserção simples...');
    const { data: novoBrinquedo, error: insertError } = await supabase
      .from('brinquedo')
      .insert({
        id: crypto.randomUUID(),
        nome: 'Teste de Conexão',
        descricao: 'Brinquedo de teste',
        fotos: '[]',
        tema_layout: 'classico_divertido',
        dimensoes: '3x3m',
        faixa_etaria: '3-5 anos',
        status: 'DISPONIVEL',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir brinquedo de teste:', insertError);
    } else {
      console.log('✅ Inserção de teste OK');
      console.log('Brinquedo criado:', novoBrinquedo.id);

      // Deletar o brinquedo de teste
      await supabase.from('brinquedo').delete().eq('id', novoBrinquedo.id);
      console.log('✅ Brinquedo de teste deletado');
    }

    console.log('\n5. Verificando estrutura da tabela brinquedo...');
    const { data: columns } = await supabase
      .rpc('get_table_columns', { table_name: 'brinquedo' })
      .catch(() => null);

    if (columns) {
      console.log('Colunas:', columns);
    } else {
      console.log('Não foi possível verificar colunas (função RPC não existe)');
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testConnection();
