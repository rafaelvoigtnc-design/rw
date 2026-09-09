import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit
} from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Brinquedos
export async function getBrinquedos(filters?: { faixaEtaria?: string; busca?: string; ordenacao?: string }) {
  let q = collection(db, 'brinquedos');
  
  if (filters?.faixaEtaria) {
    q = query(q, where('faixa_etaria', '==', filters.faixaEtaria));
  }
  
  if (filters?.busca) {
    q = query(q, where('nome', '>=', filters.busca), where('nome', '<=', filters.busca + '\uf8ff'));
  }
  
  const snapshot = await getDocs(q);
  let brinquedos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  if (filters?.ordenacao === 'nome_desc') {
    brinquedos = brinquedos.reverse();
  } else {
    brinquedos.sort((a, b) => a.nome.localeCompare(b.nome));
  }
  
  return brinquedos;
}

export async function getBrinquedoById(id: string) {
  const docRef = doc(db, 'brinquedos', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getAllBrinquedos() {
  const snapshot = await getDocs(collection(db, 'brinquedos'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createBrinquedo(data: any) {
  return await addDoc(collection(db, 'brinquedos'), {
    ...data,
    criado_em: new Date().toISOString()
  });
}

export async function updateBrinquedo(id: string, data: any) {
  const docRef = doc(db, 'brinquedos', id);
  await updateDoc(docRef, data);
  return { id, ...data };
}

export async function deleteBrinquedo(id: string) {
  const docRef = doc(db, 'brinquedos', id);
  await deleteDoc(docRef);
  return { id };
}

// Promoções
export async function getPromocoes() {
  const q = query(collection(db, 'promocoes'), where('ativa', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllPromocoes() {
  const snapshot = await getDocs(collection(db, 'promocoes'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createPromocao(data: any) {
  return await addDoc(collection(db, 'promocoes'), {
    ...data,
    criado_em: new Date().toISOString()
  });
}

export async function updatePromocao(id: string, data: any) {
  const docRef = doc(db, 'promocoes', id);
  await updateDoc(docRef, data);
  return { id, ...data };
}

export async function deletePromocao(id: string) {
  const docRef = doc(db, 'promocoes', id);
  await deleteDoc(docRef);
  return { id };
}

// Avaliações
export async function getAvaliacoes() {
  const q = query(collection(db, 'avaliacoes'), where('aprovado_para_exibir', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllAvaliacoes() {
  const snapshot = await getDocs(collection(db, 'avaliacoes'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createAvaliacao(data: any) {
  console.log('createAvaliacao chamado com:', data);
  const result = await addDoc(collection(db, 'avaliacoes'), {
    ...data,
    aprovado_para_exibir: false,
    criado_em: new Date().toISOString()
  });
  console.log('Avaliação criada com ID:', result.id);
  return result;
}

export async function updateAvaliacao(id: string, data: any) {
  const docRef = doc(db, 'avaliacoes', id);
  await updateDoc(docRef, data);
  return { id, ...data };
}

export async function deleteAvaliacao(id: string) {
  const docRef = doc(db, 'avaliacoes', id);
  await deleteDoc(docRef);
  return { id };
}

// Categorias
export async function getCategorias() {
  const snapshot = await getDocs(collection(db, 'categorias'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Banners
export async function getBanners() {
  const q = query(collection(db, 'banners'), where('ativo', '==', true));
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Ordenar por ordem no cliente
  data.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  return data;
}

export async function getAllBanners() {
  const snapshot = await getDocs(collection(db, 'banners'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createBanner(data: any) {
  return await addDoc(collection(db, 'banners'), {
    ...data,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  });
}

export async function updateBanner(id: string, data: any) {
  const docRef = doc(db, 'banners', id);
  await updateDoc(docRef, { ...data, atualizado_em: new Date().toISOString() });
  return { id, ...data };
}

export async function deleteBanner(id: string) {
  const docRef = doc(db, 'banners', id);
  await deleteDoc(docRef);
  return { id };
}

// Clientes
export async function getClienteByEmail(email: string) {
  const q = query(collection(db, 'clientes'), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
  return null;
}

export async function getClienteById(id: string) {
  const docRef = doc(db, 'clientes', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function createCliente(data: any) {
  return await addDoc(collection(db, 'clientes'), {
    ...data,
    criado_em: new Date().toISOString()
  });
}

export async function updateCliente(id: string, data: any) {
  console.log(`updateCliente chamado com ID: "${id}"`);
  
  // Buscar todos os clientes e encontrar o correto
  const snapshot = await getDocs(collection(db, 'clientes'));
  const clienteDoc = snapshot.docs.find(doc => doc.id === id);
  
  console.log(`Cliente encontrado na lista: ${!!clienteDoc}`);
  
  if (!clienteDoc) {
    throw new Error(`Cliente com ID "${id}" não encontrado no Firebase`);
  }
  
  // Use o documento reference do snapshot
  await updateDoc(clienteDoc.ref, data);
  console.log('Cliente atualizado com sucesso');
  return { id, ...data };
}

export async function deleteCliente(id: string) {
  console.log(`deleteCliente chamado com ID: "${id}"`);
  
  // Buscar todos os clientes e encontrar o correto
  const snapshot = await getDocs(collection(db, 'clientes'));
  const clienteDoc = snapshot.docs.find(doc => doc.id === id);
  
  console.log(`Cliente encontrado na lista: ${!!clienteDoc}`);
  
  if (!clienteDoc) {
    throw new Error(`Cliente com ID "${id}" não encontrado no Firebase`);
  }
  
  // Use o documento reference do snapshot
  await deleteDoc(clienteDoc.ref);
  console.log('Cliente excluído com sucesso');
  return { id };
}

// Admins
export async function getAdminByEmail(email: string) {
  const q = query(collection(db, 'admins'), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
  return null;
}

// Locações
export async function getLocacoes() {
  const snapshot = await getDocs(collection(db, 'locacoes'));
  const locacoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

  // Buscar itens de cada locação
  for (const locacao of locacoes) {
    const itensSnapshot = await getDocs(
      query(collection(db, 'locacao_itens'), where('locacao_id', '==', locacao.id))
    );
    const itens = itensSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

    // Buscar nome do brinquedo para cada item se não tiver salvo
    for (const item of itens) {
      if (!item.brinquedo_nome && item.brinquedo_id) {
        const brinquedoDoc = await getDoc(doc(db, 'brinquedos', item.brinquedo_id));
        if (brinquedoDoc.exists()) {
          item.brinquedo_nome = brinquedoDoc.data().nome;
        }
      }
      
      // Se ainda não tiver nome, usar 'Brinquedo não informado'
      if (!item.brinquedo_nome) {
        item.brinquedo_nome = 'Brinquedo não informado';
      }
    }

    locacao.locacao_item = itens;
  }

  return locacoes;
}

export async function getLocacoesByCliente(clienteId: string) {
  const q = query(collection(db, 'locacoes'), where('cliente_id', '==', clienteId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createLocacao(data: any) {
  return await addDoc(collection(db, 'locacoes'), {
    ...data,
    criado_em: new Date().toISOString()
  });
}

export async function updateLocacao(id: string, data: any) {
  const docRef = doc(db, 'locacoes', id);
  await updateDoc(docRef, data);
  return { id, ...data };
}

export async function getLocacaoById(id: string) {
  const docRef = doc(db, 'locacoes', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function deleteLocacao(id: string) {
  const docRef = doc(db, 'locacoes', id);
  await deleteDoc(docRef);
  return { id };
}

// Itens de Locação
export async function createLocacaoItem(data: any) {
  return await addDoc(collection(db, 'locacao_itens'), {
    ...data,
    criado_em: new Date().toISOString()
  });
}

export async function getLocacaoItens(locacaoId: string) {
  const q = query(collection(db, 'locacao_itens'), where('locacao_id', '==', locacaoId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteLocacaoItens(locacaoId: string) {
  const q = query(collection(db, 'locacao_itens'), where('locacao_id', '==', locacaoId));
  const snapshot = await getDocs(q);
  
  for (const item of snapshot.docs) {
    await deleteDoc(doc(db, 'locacao_itens', item.id));
  }
}

// Transações Financeiras
export async function createTransacao(data: any) {
  return await addDoc(collection(db, 'transacoes'), {
    ...data,
    criado_em: new Date().toISOString()
  });
}

export async function getTransacoes() {
  const snapshot = await getDocs(collection(db, 'transacoes'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Favoritos
export async function getFavoritos(clienteId: string) {
  const q = query(collection(db, 'favoritos'), where('cliente_id', '==', clienteId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function toggleFavorito(clienteId: string, brinquedoId: string) {
  const q = query(
    collection(db, 'favoritos'),
    where('cliente_id', '==', clienteId),
    where('brinquedo_id', '==', brinquedoId)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    await deleteDoc(doc(db, 'favoritos', snapshot.docs[0].id));
    return { favorito: false };
  } else {
    await addDoc(collection(db, 'favoritos'), {
      cliente_id: clienteId,
      brinquedo_id: brinquedoId,
      criado_em: new Date().toISOString()
    });
    return { favorito: true };
  }
}

// Upload de Imagens para Firebase Storage
export async function uploadImagem(file: File, path: string): Promise<string> {
  try {
    console.log('Iniciando upload para Storage:', path);
    const storageRef = ref(storage, path);
    console.log('Storage ref criada:', storageRef);
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload concluído:', snapshot);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('URL obtida:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Erro no upload para Storage:', error);
    throw error;
  }
}

export async function deleteImagem(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

// Fotos de Brinquedos (subcoleção para contornar limite de 1MB)
export async function addFotoBrinquedo(brinquedoId: string, fotoData: string) {
  return await addDoc(collection(db, 'brinquedos', brinquedoId, 'fotos'), {
    data: fotoData,
    criado_em: new Date().toISOString()
  });
}

export async function getFotosBrinquedo(brinquedoId: string) {
  const snapshot = await getDocs(collection(db, 'brinquedos', brinquedoId, 'fotos'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteFotoBrinquedo(brinquedoId: string, fotoId: string) {
  await deleteDoc(doc(db, 'brinquedos', brinquedoId, 'fotos', fotoId));
}

export async function deleteTodasFotosBrinquedo(brinquedoId: string) {
  const snapshot = await getDocs(collection(db, 'brinquedos', brinquedoId, 'fotos'));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
}
