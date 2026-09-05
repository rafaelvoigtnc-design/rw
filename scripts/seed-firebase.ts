import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXHqKv_mkBDygzYrG1EPLPa14AKBzdgOE",
  authDomain: "rw-brinquedos.firebaseapp.com",
  projectId: "rw-brinquedos",
  storageBucket: "rw-brinquedos.firebasestorage.app",
  messagingSenderId: "1088637973256",
  appId: "1:1088637973256:web:ca74bcdc7c0eaffb0df2bd",
  measurementId: "G-WJLPN1RMJR"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function seedFirebase() {
  console.log('🚀 Criando dados de teste no Firebase...');

  try {
    // Categorias
    console.log('📦 Criando Categorias...');
    const categorias = [
      { nome: 'Infláveis', icone: '🎈' },
      { nome: 'Casinhas', icone: '🏠' },
      { nome: 'Piscinas', icone: '🏊' },
      { nome: 'Brinquedos', icone: '🎮' }
    ];
    
    for (const cat of categorias) {
      await addDoc(collection(db, 'categorias'), cat);
    }
    console.log('✅ Categorias criadas');

    // Brinquedos
    console.log('🧸 Criando Brinquedos...');
    const brinquedos = [
      {
        nome: 'Pula Pula Safari',
        categoria_id: 'inflaveis',
        descricao: 'Pula pula temático de safari com animais',
        fotos: ['https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400'],
        dimensoes: '4m x 4m x 3m',
        faixa_etaria: '3-12 anos',
        preco_periodo: 150,
        status: 'DISPONIVEL',
        tema_layout: 'INFANTIL_LUDICO',
        mostrar_home: true,
        criado_em: new Date().toISOString()
      },
      {
        nome: 'Casa da Princesa',
        categoria_id: 'casinhas',
        descricao: 'Casinha encantada para pequenas princesas',
        fotos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
        dimensoes: '3m x 3m x 2.5m',
        faixa_etaria: '3-8 anos',
        preco_periodo: 120,
        status: 'DISPONIVEL',
        tema_layout: 'FESTA_ELEGANTE',
        mostrar_home: true,
        criado_em: new Date().toISOString()
      },
      {
        nome: 'Piscina de Bolinhas',
        categoria_id: 'piscinas',
        descricao: 'Piscina com 5000 bolinhas coloridas',
        fotos: ['https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400'],
        dimensoes: '2m x 2m x 0.5m',
        faixa_etaria: '1-5 anos',
        preco_periodo: 80,
        status: 'DISPONIVEL',
        tema_layout: 'INFANTIL_LUDICO',
        mostrar_home: true,
        criado_em: new Date().toISOString()
      }
    ];
    
    for (const brinq of brinquedos) {
      await addDoc(collection(db, 'brinquedos'), brinq);
    }
    console.log('✅ Brinquedos criados');

    // Promoções
    console.log('🎁 Criando Promoções...');
    const hoje = new Date();
    const semanaQueVem = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    await addDoc(collection(db, 'promocoes'), {
      titulo: 'Promoção Lançamento',
      descricao: '20% de desconto em todos os infláveis para novos clientes!',
      data_inicio: hoje.toISOString(),
      data_fim: semanaQueVem.toISOString(),
      ativa: true,
      criado_em: hoje.toISOString()
    });
    console.log('✅ Promoções criadas');

    // Banner
    console.log('🖼️ Criando Banner...');
    await addDoc(collection(db, 'banners'), {
      titulo: 'Festa Inesquecível',
      subtitulo: 'Brinquedos para todas as idades',
      descricao: 'Transforme seu evento em uma festa mágica',
      botao_primario: 'Ver Catálogo',
      link_primario: '/catalogo',
      botao_secundario: 'Fale Conosco',
      link_secundario: '/contato',
      gradiente: 'from-primary-blue-500 to-primary-green-500',
      imagem: null,
      badge: 'Novo',
      ativo: true,
      ordem: 1,
      criado_em: hoje.toISOString(),
      atualizado_em: hoje.toISOString()
    });
    console.log('✅ Banner criado');

    // Avaliação de teste
    console.log('⭐ Criando Avaliação de teste...');
    await addDoc(collection(db, 'avaliacoes'), {
      cliente_id: 'cliente_teste',
      texto: 'Excelente serviço! Meus filhos adoraram o pula pula.',
      nota: 5,
      foto: null,
      aprovado_para_exibir: true,
      criado_em: hoje.toISOString()
    });
    console.log('✅ Avaliação criada');

    console.log('🎉 Dados de teste criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar dados:', error);
    throw error;
  }
}

seedFirebase();
