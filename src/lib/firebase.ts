import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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
const auth = getAuth(app);

// Configurar persistência local para manter login após refresh
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistência do Firebase configurada com sucesso');
  })
  .catch((error) => {
    console.error('Erro ao configurar persistência:', error);
  });

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
