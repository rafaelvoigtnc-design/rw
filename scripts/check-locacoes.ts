import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

async function checkLocacoes() {
  console.log('🔍 Verificando estrutura de locações no Firebase...\n');

  try {
    const snapshot = await getDocs(collection(db, 'locacoes'));
    console.log(`Total de locações: ${snapshot.docs.length}`);
    
    if (snapshot.docs.length > 0) {
      const firstDoc = snapshot.docs[0];
      console.log('\n📄 Estrutura da primeira locação:');
      console.log('ID:', firstDoc.id);
      console.log('Dados:', JSON.stringify(firstDoc.data(), null, 2));
      
      // Tentar buscar por ID específico
      console.log('\n🔍 Testando busca por ID:', firstDoc.id);
      const docRef = doc(db, 'locacoes', firstDoc.id);
      const docSnap = await getDoc(docRef);
      console.log('Existe:', docSnap.exists());
      if (docSnap.exists()) {
        console.log('Dados por ID:', JSON.stringify(docSnap.data(), null, 2));
      }
    } else {
      console.log('Nenhuma locação encontrada');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar locações:', error);
  }
}

checkLocacoes();
