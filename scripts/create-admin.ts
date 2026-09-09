import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { hashPassword } from '../src/lib/auth';

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

async function createAdmin() {
  const email = 'admin@rwbrinquedos.com';
  const password = 'admin123';

  console.log('🔍 Verificando se admin existe...');
  
  const q = query(collection(db, 'admins'), where('email', '==', email));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    console.log('✅ Admin já existe com email:', email);
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    return;
  }

  console.log('📝 Criando novo admin...');
  
  const hashedPassword = await hashPassword(password);
  const adminId = crypto.randomUUID();
  
  await setDoc(doc(collection(db, 'admins'), adminId), {
    id: adminId,
    nome: 'Administrador',
    email: email,
    senha_hash: hashedPassword,
    criado_em: new Date().toISOString()
  });

  console.log('✅ Admin criado com sucesso!');
  console.log('📧 Email:', email);
  console.log('🔑 Senha:', password);
  console.log('');
  console.log('⚠️  IMPORTANTE: Altere estas credenciais após o primeiro login!');
}

createAdmin().catch(console.error);
