import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

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
  'contratos',
  'banners'
];

async function clearAllData() {
  console.log('🧹 Iniciando limpeza completa do Firebase...');
  console.log('⚠️  Isso vai excluir TODOS os dados de todas as coleções!\n');

  let totalDeleted = 0;

  for (const collectionName of collections) {
    try {
      console.log(`📦 Processando coleção: ${collectionName}`);
      
      const snapshot = await getDocs(collection(db, collectionName));
      const count = snapshot.size;
      
      if (count === 0) {
        console.log(`   ✅ Coleção vazia: ${collectionName}`);
        continue;
      }

      console.log(`   🗑️  Encontrados ${count} documento(s) em ${collectionName}`);
      
      let deletedCount = 0;
      for (const docSnapshot of snapshot.docs) {
        await deleteDoc(doc(db, collectionName, docSnapshot.id));
        deletedCount++;
      }
      
      console.log(`   ✅ Excluídos ${deletedCount} documento(s) de ${collectionName}`);
      totalDeleted += deletedCount;
    } catch (error) {
      console.error(`   ❌ Erro ao processar ${collectionName}:`, error);
    }
  }

  console.log(`\n🎉 Limpeza concluída! Total de ${totalDeleted} documentos excluídos.`);
  console.log('✅ O Firebase agora está completamente vazio.');
  console.log('\n💡 Você pode criar seus dados do zero através do painel admin.');
}

clearAllData().catch(console.error);
