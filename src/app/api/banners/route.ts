import { NextResponse } from 'next/server';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
  try {
    console.log('Buscando banners do Firebase...');
    const q = query(
      collection(db, 'banners'),
      where('ativo', '==', true)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Ordenar por ordem no cliente
    data.sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));

    console.log(`Retornando ${data.length} banners`);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar banners:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar banners', details: String(error) },
      { status: 500 }
    );
  }
}
