import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

async function testToggleBanner() {
  console.log('🔍 Buscando banners no Firebase...');
  
  const snapshot = await getDocs(collection(db, 'banners'));
  const banners: any[] = [];
  
  snapshot.forEach(doc => {
    banners.push({ id: doc.id, ...doc.data() });
  });

  if (banners.length === 0) {
    console.log('⚠️  Nenhum banner encontrado!');
    return;
  }

  // Pegar o primeiro banner para teste
  const testBanner = banners[0];
  console.log(`\n🧪 Testando com banner: ${testBanner.titulo}`);
  console.log(`   Estado atual: ${testBanner.ativo ? '✅ Ativo' : '❌ Inativo'}`);

  // Pausar o banner
  console.log('\n🔄 Pausando banner...');
  await updateDoc(doc(db, 'banners', testBanner.id), {
    ativo: false,
    atualizado_em: new Date().toISOString()
  });

  // Verificar estado após pausa
  const snapshot2 = await getDocs(collection(db, 'banners'));
  const updatedBanners: any[] = [];
  snapshot2.forEach(doc => {
    updatedBanners.push({ id: doc.id, ...doc.data() });
  });

  const updatedBanner = updatedBanners.find(b => b.id === testBanner.id);
  console.log(`   Estado após pausa: ${updatedBanner.ativo ? '✅ Ativo' : '❌ Inativo'}`);

  // Verificar quais banners apareceriam na API pública
  const activeBanners = updatedBanners.filter(b => b.ativo);
  console.log(`\n📊 Banners que apareceriam no site: ${activeBanners.length}`);
  activeBanners.forEach((b, i) => {
    console.log(`   ${i + 1}. ${b.titulo}`);
  });

  // Reativar o banner
  console.log('\n🔄 Reativando banner...');
  await updateDoc(doc(db, 'banners', testBanner.id), {
    ativo: true,
    atualizado_em: new Date().toISOString()
  });

  console.log('✅ Teste concluído!');
  console.log('\n💡 Se o banner pausado ainda aparece no site, pode ser:');
  console.log('   1. Cache do navegador (tente Ctrl+F5)');
  console.log('   2. Cache da Vercel (pode levar alguns minutos)');
  console.log('   3. Problema no componente HeroCarousel');
}

testToggleBanner().catch(console.error);
