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

async function testPauseBanner() {
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

  const banner = banners[0];
  console.log(`\n📋 Banner atual: ${banner.titulo}`);
  console.log(`   Ativo: ${banner.ativo ? '✅ Sim' : '❌ Não'}`);
  console.log(`   Atualizado em: ${banner.atualizado_em}`);

  // Pausar o banner
  console.log('\n🔄 Pausando banner...');
  await updateDoc(doc(db, 'banners', banner.id), {
    ativo: false,
    atualizado_em: new Date().toISOString()
  });

  // Verificar novamente
  const snapshot2 = await getDocs(collection(db, 'banners'));
  const updatedBanners: any[] = [];
  snapshot2.forEach(doc => {
    updatedBanners.push({ id: doc.id, ...doc.data() });
  });

  const updatedBanner = updatedBanners.find(b => b.id === banner.id);
  console.log(`\n✅ Banner pausado: ${updatedBanner.titulo}`);
  console.log(`   Ativo: ${updatedBanner.ativo ? '✅ Sim' : '❌ Não'}`);
  console.log(`   Atualizado em: ${updatedBanner.atualizado_em}`);

  // Reativar
  console.log('\n🔄 Reativando banner...');
  await updateDoc(doc(db, 'banners', banner.id), {
    ativo: true,
    atualizado_em: new Date().toISOString()
  });

  console.log('✅ Teste concluído!');
  console.log('\n💡 Se o banner pausado ainda aparece no site:');
  console.log('   1. Aguarde até 30 segundos (recarregamento automático)');
  console.log('   2. Ou limpe o cache do navegador (Ctrl+Shift+R)');
}

testPauseBanner().catch(console.error);
