import { NextResponse } from 'next/server';
import { collection, addDoc, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const backupData = await request.json();

    console.log('📥 [API RESTORE] Iniciando restore do sistema...');
    console.log('📥 [API RESTORE] Timestamp do backup:', backupData.timestamp);

    if (!backupData.data) {
      return NextResponse.json(
        { error: 'Dados de backup inválidos' },
        { status: 400 }
      );
    }

    const collections = [
      'brinquedos',
      'clientes',
      'locacoes',
      'locacao_itens',
      'transacoes',
      'promocoes',
      'banners',
      'admins',
      'favoritos',
    ];

    // Limpar dados existentes e restaurar
    for (const collectionName of collections) {
      const data = backupData.data[collectionName] || [];

      // Limpar coleção existente
      const existingSnapshot = await getDocs(collection(db, collectionName));
      for (const doc of existingSnapshot.docs) {
        await deleteDoc(doc.ref);
      }
      console.log(`📥 [API RESTORE] ${collectionName}: ${existingSnapshot.size} documentos removidos`);

      // Restaurar dados
      for (const item of data) {
        const { id, ...itemData } = item;
        if (id) {
          await setDoc(doc(db, collectionName, id), itemData);
        } else {
          await addDoc(collection(db, collectionName), itemData);
        }
      }
      console.log(`📥 [API RESTORE] ${collectionName}: ${data.length} documentos restaurados`);
    }

    console.log('✅ [API RESTORE] Restore concluído com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Restore concluído com sucesso',
      timestamp: backupData.timestamp,
    });
  } catch (error) {
    console.error('❌ [API RESTORE] Erro ao fazer restore:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer restore do sistema' },
      { status: 500 }
    );
  }
}
