import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXHqKv_mkBDygzYrG1EPLPa14AKBzdgOE",
  authDomain: "rw-brinquedos.firebaseapp.com",
  projectId: "rw-brinquedos",
  storageBucket: "gs://rw-brinquedos.appspot.com",
  messagingSenderId: "1088637973256",
  appId: "1:1088637973256:web:ca74bcdc7c0eaffb0df2bd",
  measurementId: "G-WJLPN1RMJR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanBanners() {
  console.log('🔍 Buscando todos os banners no Firebase...');
  
  const snapshot = await getDocs(collection(db, 'banners'));
  const banners: any[] = [];
  
  snapshot.forEach(doc => {
    banners.push({ id: doc.id, ...doc.data() });
  });

  console.log(`📋 Encontrados ${banners.length} banner(s) no total`);
  
  if (banners.length === 0) {
    console.log('⚠️  Nenhum banner encontrado!');
    return;
  }

  console.log('\n📊 Lista de banners:');
  banners.forEach((banner, index) => {
    console.log(`${index + 1}. ID: ${banner.id}`);
    console.log(`   Título: ${banner.titulo}`);
    console.log(`   Ativo: ${banner.ativo ? '✅' : '❌'}`);
    console.log(`   Ordem: ${banner.ordem}`);
    console.log('');
  });

  console.log('⚠️  AVISO: Este script vai EXCLUIR TODOS os banners e recriar apenas 3 banners padrão.');
  console.log('Se você quer apenas pausar banners, use o painel admin.');
  console.log('');
  
  // Excluir todos
  console.log('🗑️  Excluindo todos os banners...');
  for (const banner of banners) {
    await deleteDoc(doc(db, 'banners', banner.id));
    console.log(`   ❌ Excluído: ${banner.titulo}`);
  }

  // Recriar 3 banners padrão
  console.log('\n📝 Recriando 3 banners padrão...');
  const defaultBanners = [
    {
      titulo: 'Diversão Garantida para sua Festa!',
      subtitulo: 'Locação de brinquedos, infláveis, decoração e itens para festas',
      descricao: 'Transforme seu evento em uma experiência inesquecível com nossos brinquedos e serviços premium.',
      botao_primario: 'Solicitar Orçamento',
      link_primario: '/catalogo',
      botao_secundario: 'Ver Catálogo',
      link_secundario: '/catalogo',
      gradiente: 'from-primary-blue-400 via-primary-blue-500 to-primary-green-400',
      imagem: '/logo-sem-fundo.png',
      badge: null,
      ativo: true,
      ordem: 1,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      titulo: 'Combo Família',
      subtitulo: '2 brinquedos com 10% OFF',
      descricao: 'Aproveite nossa promoção exclusiva do mês e economize na festa dos seus filhos!',
      botao_primario: 'Quero Aproveitar',
      link_primario: '/promocoes',
      botao_secundario: 'Ver Detalhes',
      link_secundario: '/promocoes',
      gradiente: 'from-primary-yellow-400 via-primary-orange-400 to-primary-orange-500',
      imagem: '/logo-sem-fundo.png',
      badge: 'Promoção do Mês',
      ativo: true,
      ordem: 2,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      titulo: 'Transformamos sua festa em uma experiência inesquecível',
      subtitulo: 'Aniversários, decorações, mesas e personagens',
      descricao: 'Serviços completos para eventos memoráveis com qualidade e segurança.',
      botao_primario: 'Conhecer Serviços',
      link_primario: '/sobre',
      botao_secundario: 'Ver Galeria',
      link_secundario: '/depoimentos',
      gradiente: 'from-primary-green-400 via-primary-blue-400 to-primary-blue-500',
      imagem: '/logo-sem-fundo.png',
      badge: null,
      ativo: true,
      ordem: 3,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
  ];

  for (const banner of defaultBanners) {
    await addDoc(collection(db, 'banners'), banner);
    console.log(`   ✅ Criado: ${banner.titulo}`);
  }

  console.log('\n✅ Limpeza concluída! 3 banners padrão criados e ativos.');
}

cleanBanners().catch(console.error);
