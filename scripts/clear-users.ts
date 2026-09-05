import { initializeApp } from 'firebase/app';
import { getAuth, deleteUser, listUsers } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXHqKv_mkBDygzYrG1EPLPa14AKBzdgOE",
  authDomain: "rw-brinquedos.firebaseapp.com",
  projectId: "rw-brinquedos",
  storageBucket: "rw-brinquedos.firebasestorage.app",
  messagingSenderId: "1088637973256",
  appId: "1:1088637973256:web:ca74bcdc7c0eaffb0df2bd",
  measurementId: "G-WJLPN1RMJR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function clearAllUsers() {
  try {
    console.log('Iniciando limpeza de usuários...');

    // Limpar documentos de clientes no Firestore
    const clientesSnapshot = await getDocs(collection(db, 'clientes'));
    console.log(`Encontrados ${clientesSnapshot.size} clientes no Firestore`);

    for (const clienteDoc of clientesSnapshot.docs) {
      await deleteDoc(doc(db, 'clientes', clienteDoc.id));
      console.log(`Cliente ${clienteDoc.id} deletado do Firestore`);
    }

    console.log('Todos os clientes foram deletados do Firestore');
    console.log('NOTA: Usuários do Firebase Authentication precisam ser deletados manualmente no console do Firebase');
    console.log('Acesse: https://console.firebase.google.com/project/rw-brinquedos/authentication/users');

  } catch (error) {
    console.error('Erro ao limpar usuários:', error);
  }
}

clearAllUsers();