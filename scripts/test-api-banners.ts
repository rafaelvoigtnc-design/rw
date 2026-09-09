// Teste direto da API de banners
async function testBannersAPI() {
  console.log('🧪 Testando API /api/banners...');
  
  try {
    const response = await fetch('http://localhost:3000/api/banners');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Dados recebidos:', JSON.stringify(data, null, 2));
    console.log('É array?', Array.isArray(data));
    console.log('Quantidade:', Array.isArray(data) ? data.length : 'N/A');
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('\n📊 Banners retornados:');
      data.forEach((banner, i) => {
        console.log(`${i + 1}. ${banner.titulo} - Ativo: ${banner.ativo ? '✅' : '❌'}`);
      });
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
    console.log('\n💡 Certifique-se de que o servidor está rodando (npm run dev)');
  }
}

testBannersAPI();
