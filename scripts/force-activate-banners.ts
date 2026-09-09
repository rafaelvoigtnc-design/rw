import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

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

async function forceActivateBanners() {
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

  console.log('\n📊 Estado atual dos banners:');
  banners.forEach((banner, index) => {
    console.log(`${index + 1}. ${banner.titulo} - Ativo: ${banner.ativo ? '✅' : '❌'} - Ordem: ${banner.ordem}`);
  });

  console.log('\n🔄 Ativando todos os banners...');
  
  for (const banner of banners) {
    console.log(`Atualizando: ${banner.titulo}`);
    await updateDoc(doc(db, 'banners', banner.id), {
      ativo: true,
      atualizado_em: new Date().toISOString()
    });
  }

  console.log('\n✅ Todos os banners foram ativados!');
  
  // Verificar novamente
  const snapshot2 = await getDocs(collection(db, 'banners'));
  const updatedBanners: any[] = [];
  snapshot2.forEach(doc => {
    updatedBanners.push({ id: doc.id, ...doc.data() });
  });

  console.log('\n📊 Estado após atualização:');
  updatedBanners.forEach((banner, index) => {
    console.log(`${index + 1}. ${banner.titulo} - Ativo: ${banner.ativo ? '✅' : '❌'} - Ordem: ${banner.ordem}`);
  });
}

forceActivateBanners().catch(console.error);
