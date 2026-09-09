import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkBanners() {
  console.log('🔍 Verificando banners no Firebase...');
  
  const snapshot = await getDocs(collection(db, 'banners'));
  const banners: any[] = [];
  
  snapshot.forEach(doc => {
    banners.push({ id: doc.id, ...doc.data() });
  });

  console.log(`📋 Encontrados ${banners.length} banner(s):`);
  
  if (banners.length === 0) {
    console.log('⚠️  Nenhum banner encontrado!');
    return;
  }

  // Ordenar por ordem
  banners.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  banners.forEach((banner, index) => {
    console.log(`\n${index + 1}. Banner ID: ${banner.id}`);
    console.log(`   Título: ${banner.titulo}`);
    console.log(`   Subtítulo: ${banner.subtitulo}`);
    console.log(`   Ativo: ${banner.ativo ? '✅ Sim' : '❌ Não'}`);
    console.log(`   Ordem: ${banner.ordem}`);
    console.log(`   Gradiente: ${banner.gradiente}`);
    console.log(`   Badge: ${banner.badge || 'Nenhum'}`);
    console.log(`   Imagem: ${banner.imagem || 'Nenhuma'}`);
  });

  console.log('\n✅ Verificação concluída!');
}

checkBanners().catch(console.error);
