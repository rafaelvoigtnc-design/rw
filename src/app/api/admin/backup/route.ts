import { NextResponse } from 'next/server';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    console.log('📦 [API BACKUP] Iniciando backup do sistema...');

    // Buscar dados de todas as coleções
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

    const backupData: any = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {},
    };

    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      backupData.data[collectionName] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(`📦 [API BACKUP] ${collectionName}: ${backupData.data[collectionName].length} documentos`);
    }

    console.log('✅ [API BACKUP] Backup concluído com sucesso');

    return NextResponse.json(backupData);
  } catch (error) {
    console.error('❌ [API BACKUP] Erro ao fazer backup:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer backup do sistema' },
      { status: 500 }
    );
  }
}
