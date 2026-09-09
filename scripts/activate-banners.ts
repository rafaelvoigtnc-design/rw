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

async function activateBanners() {
  console.log('🔍 Buscando banners no Firebase...');
  
  const snapshot = await getDocs(collection(db, 'banners'));
  const banners: any[] = [];
  
  snapshot.forEach(doc => {
    banners.push({ id: doc.id, ...doc.data() });
  });

  console.log(`📋 Encontrados ${banners.length} banner(s)`);
  
  if (banners.length === 0) {
    console.log('⚠️  Nenhum banner encontrado!');
    return;
  }

  let activatedCount = 0;
  
  for (const banner of banners) {
    if (!banner.ativo) {
      console.log(`🔄 Ativando banner: ${banner.titulo}`);
      await updateDoc(doc(db, 'banners', banner.id), {
        ativo: true,
        atualizado_em: new Date().toISOString()
      });
      activatedCount++;
    } else {
      console.log(`✅ Banner já ativo: ${banner.titulo}`);
    }
  }

  console.log(`\n✅ Ativados ${activatedCount} banner(s)!`);
  console.log('🎉 Todos os banners agora estão ativos e aparecerão no site.');
}

activateBanners().catch(console.error);
