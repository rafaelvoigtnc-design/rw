import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    // Obter token do header de autorização
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json([], { status: 200 });
    }

    // Decodificar o token para obter UID
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return NextResponse.json([], { status: 200 });
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const uid = payload.user_id || payload.uid;
      
      if (!uid) {
        return NextResponse.json([], { status: 200 });
      }

      const q = query(collection(db, 'carrinho'), where('cliente_id', '==', uid));
      const snapshot = await getDocs(q);
      
      const carrinho = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const item = { id: docSnapshot.id, ...docSnapshot.data() };
        // Buscar dados do brinquedo
        if (item.brinquedo_id) {
          const brinquedoDoc = await getDoc(doc(db, 'brinquedos', item.brinquedo_id));
          if (brinquedoDoc.exists()) {
            item.brinquedo = { id: brinquedoDoc.id, ...brinquedoDoc.data() };
          }
        }
        return item;
      }));
      
      return NextResponse.json(carrinho);
    } catch (decodeError) {
      console.error('Erro ao decodificar token:', decodeError);
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    // Obter token do header de autorização
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Decodificar o token para obter UID
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const uid = payload.user_id || payload.uid;
      
      if (!uid) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
      }

      const { brinquedoId, dataInteresse } = await request.json();
      console.log('Brinquedo ID:', brinquedoId);

      // Verificar se já existe no carrinho
      const q = query(
        collection(db, 'carrinho'),
        where('cliente_id', '==', uid),
        where('brinquedo_id', '==', brinquedoId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return NextResponse.json(
          { error: 'Brinquedo já está no carrinho' },
          { status: 400 }
        );
      }

      const docRef = await addDoc(collection(db, 'carrinho'), {
        cliente_id: uid,
        brinquedo_id: brinquedoId,
        data_interesse: dataInteresse || null,
        criado_em: new Date().toISOString()
      });

      const newItem = { id: docRef.id, cliente_id: uid, brinquedo_id: brinquedoId };
      return NextResponse.json(newItem);
    } catch (decodeError) {
      console.error('Erro ao decodificar token:', decodeError);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar ao carrinho' },
      { status: 500 }
    );
  }
}
