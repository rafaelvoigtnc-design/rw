import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
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

async function recreateAdmin() {
  const email = 'admin@rwbrinquedos.com';
  const password = 'RafaWill99';

  console.log('🔐 Recriando admin...');
  
  const hashedPassword = await hashPassword(password);
  
  await addDoc(collection(db, 'admins'), {
    nome: 'Administrador',
    email: email,
    senha_hash: hashedPassword,
    criado_em: new Date().toISOString()
  });

  console.log('✅ Admin recriado com sucesso!');
  console.log('📧 Email:', email);
  console.log('🔑 Senha:', password);
  console.log('\n⚠️  Configure estas credenciais na Vercel:');
  console.log('   ADMIN_EMAIL =', email);
  console.log('   ADMIN_PASSWORD =', password);
}

recreateAdmin().catch(console.error);
