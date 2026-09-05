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

async function testCreateBrinquedo() {
  console.log('🧪 Testando criação de brinquedo...\n');

  try {
    const novoBrinquedo = {
      nome: 'Brinquedo Teste ' + new Date().toLocaleTimeString(),
      descricao: 'Este é um brinquedo de teste para verificar se aparece no site',
      fotos: ['https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400'],
      tema_layout: 'CLASSICO_DIVERTIDO',
      dimensoes: '2m x 2m x 2m',
      faixa_etaria: '3-8 anos',
      status: 'DISPONIVEL',
      categoria_id: null,
      preco_periodo: 100,
      mostrar_home: true,
    };

    console.log('Criando brinquedo:', novoBrinquedo.nome);
    const docRef = await addDoc(collection(db, 'brinquedos'), novoBrinquedo);
    
    console.log('✅ Brinquedo criado com ID:', docRef.id);
    console.log('📝 Nome:', novoBrinquedo.nome);
    console.log('🔄 Status:', novoBrinquedo.status);
    
    console.log('\n🔍 Verifique no site e no Firebase Console se o brinquedo apareceu!');
    
  } catch (error) {
    console.error('❌ Erro ao criar brinquedo:', error);
  }
}

testCreateBrinquedo();
