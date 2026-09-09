import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
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

async function updateAdminPassword() {
  const email = 'admin@rwbrinquedos.com';
  const newPassword = 'RafaWill99';

  console.log('🔍 Listando todos os admins...');
  
  const adminsSnapshot = await getDocs(collection(db, 'admins'));
  const allAdmins: any[] = [];
  
  adminsSnapshot.forEach(doc => {
    allAdmins.push({ id: doc.id, ...doc.data() });
  });

  console.log(`📋 Encontrados ${allAdmins.length} admin(s):`);
  allAdmins.forEach(admin => {
    console.log(`   - ${admin.email} (ID: ${admin.id})`);
  });

  console.log('');
  console.log('🔄 Atualizando senha do admin principal...');
  
  const hashedPassword = await hashPassword(newPassword);
  
  // Encontrar o admin principal
  const mainAdmin = allAdmins.find(a => a.email === email);
  
  if (mainAdmin) {
    await setDoc(doc(collection(db, 'admins'), mainAdmin.id), {
      ...mainAdmin,
      senha_hash: hashedPassword,
      atualizado_em: new Date().toISOString()
    });
    console.log('✅ Senha atualizada com sucesso!');
  } else {
    console.log('❌ Admin principal não encontrado, criando novo...');
    const newAdminId = crypto.randomUUID();
    await setDoc(doc(collection(db, 'admins'), newAdminId), {
      id: newAdminId,
      nome: 'Administrador',
      email: email,
      senha_hash: hashedPassword,
      criado_em: new Date().toISOString()
    });
    console.log('✅ Novo admin criado com senha atualizada!');
  }

  console.log('');
  console.log('🗑️  Removendo outros admins...');
  
  const otherAdmins = allAdmins.filter(a => a.email !== email);
  
  if (otherAdmins.length > 0) {
    for (const admin of otherAdmins) {
      await deleteDoc(doc(collection(db, 'admins'), admin.id));
      console.log(`   ❌ Removido: ${admin.email}`);
    }
    console.log(`✅ Removidos ${otherAdmins.length} admin(s) extra(s)`);
  } else {
    console.log('✅ Nenhum admin extra para remover');
  }

  console.log('');
  console.log('📧 Email:', email);
  console.log('🔑 Nova Senha:', newPassword);
  console.log('');
  console.log('⚠️  Configure estas credenciais na Vercel:');
  console.log('   ADMIN_EMAIL =', email);
  console.log('   ADMIN_PASSWORD =', newPassword);
}

updateAdminPassword().catch(console.error);
