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

const collections = [
  'admins',
  'banners',
  'brinquedos',
  'categorias',
  'promocoes',
  'avaliacoes',
  'clientes',
  'locacoes',
  'locacao_items',
  'carrinho_item',
  'favoritos',
  'transacoes_financeiras',
  'conteudo_pagina',
  'dados_empresa',
  'contratos'
];

async function verifyCleanup() {
  console.log('🔍 Verificando estado atual do Firebase...\n');

  let totalDocs = 0;
  const summary: any = {};

  for (const collectionName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const count = snapshot.size;
      totalDocs += count;
      
      if (count > 0) {
        summary[collectionName] = count;
        console.log(`📦 ${collectionName}: ${count} documento(s)`);
        
        // Mostrar IDs dos documentos
        snapshot.docs.forEach(doc => {
          console.log(`   - ID: ${doc.id}`);
        });
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar ${collectionName}:`, error);
    }
  }

  console.log(`\n📊 Total de documentos: ${totalDocs}`);
  
  if (totalDocs === 1) {
    console.log('✅ Firebase limpo! Apenas o admin existe.');
  } else if (totalDocs === 0) {
    console.log('⚠️  Firebase completamente vazio! Admin não existe.');
  } else {
    console.log('⚠️  Firebase ainda contém dados além do admin.');
  }
}

verifyCleanup().catch(console.error);
