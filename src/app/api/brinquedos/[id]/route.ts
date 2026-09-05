import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const docRef = doc(db, 'brinquedos', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Brinquedo não encontrado' },
        { status: 404 }
      );
    }

    const data = docSnap.data();
    
    // Converter fotos de JSON string para array se necessário
    const fotos = typeof data.fotos === 'string' 
      ? JSON.parse(data.fotos) 
      : (data.fotos || []);

    const brinquedoFormatado = {
      id: docSnap.id,
      ...data,
      fotos,
      categoria: data.categoria_id ? { nome: 'Categoria' } : null,
    };

    return NextResponse.json(brinquedoFormatado);
  } catch (error) {
    console.error('Erro ao buscar brinquedo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar brinquedo' },
      { status: 500 }
    );
  }
}
