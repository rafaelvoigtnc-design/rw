import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkFirebase() {
  console.log('🔍 Verificando dados no Firebase...\n');

  try {
    // Verificar brinquedos
    console.log('🧸 Brinquedos:');
    const brinquedosSnapshot = await getDocs(collection(db, 'brinquedos'));
    console.log(`Total: ${brinquedosSnapshot.docs.length} brinquedos`);
    brinquedosSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.nome} (status: ${data.status})`);
    });

    // Verificar promoções
    console.log('\n🎁 Promoções:');
    const promocoesSnapshot = await getDocs(collection(db, 'promocoes'));
    console.log(`Total: ${promocoesSnapshot.docs.length} promoções`);

    // Verificar banners
    console.log('\n🖼️ Banners:');
    const bannersSnapshot = await getDocs(collection(db, 'banners'));
    console.log(`Total: ${bannersSnapshot.docs.length} banners`);

    // Verificar categorias
    console.log('\n📦 Categorias:');
    const categoriasSnapshot = await getDocs(collection(db, 'categorias'));
    console.log(`Total: ${categoriasSnapshot.docs.length} categorias`);

  } catch (error) {
    console.error('❌ Erro ao verificar Firebase:', error);
  }
}

checkFirebase();
