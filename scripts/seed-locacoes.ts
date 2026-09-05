import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXHqKv_mkBDygzYrG1EPLPa14AKBzdgOE",
  authDomain: "rw-brinquedos.firebaseapp.com",
  projectId: "rw-brinquedos",
  storageBucket: "rw-brinquedos.firebasestorage.app",
  messagingSenderId: "1088637973256",
  appId: "1:1088637973256:web:ca74bcdc7c0eaffb0df2bd",
  measurementId: "G-WJLPN1RMJR"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function seedLocacoes() {
  console.log('🎯 Criando dados de teste para locações...');

  try {
    // Criar um cliente de teste
    const cliente = await addDoc(collection(db, 'clientes'), {
      id: 'cliente_teste_locacao',
      nome: 'Cliente Teste Locação',
      telefone: '559997302463',
      email: 'teste@locacao.com',
      senha_hash: 'hash_teste',
      endereco: 'Rua Teste, 123',
      criado_em: new Date().toISOString()
    });
    console.log('✅ Cliente criado');

    // Criar uma locação de teste
    const locacao = await addDoc(collection(db, 'locacoes'), {
      cliente_id: cliente.id,
      data_evento: '2025-09-10',
      horario_inicio: '14:00',
      horario_fim: '18:00',
      endereco: 'Rua Evento, 456',
      valor_total: 300,
      sinal_pago: 150,
      status_pagamento: 'PARCIAL',
      status_locacao: 'ORCAMENTO',
      cuidador_nome: null,
      cuidador_valor: null,
      observacoes: 'Locação de teste',
      criado_em: new Date().toISOString()
    });
    console.log('✅ Locação criada');

    // Criar item da locação
    await addDoc(collection(db, 'locacao_itens'), {
      locacao_id: locacao.id,
      brinquedo_id: 'brinquedo_teste',
      criado_em: new Date().toISOString()
    });
    console.log('✅ Item da locação criado');

    // Criar transação
    await addDoc(collection(db, 'transacoes'), {
      tipo: 'ENTRADA_LOCACAO',
      valor: 150,
      data: new Date().toISOString().split('T')[0],
      descricao: `Locação #${locacao.id}`,
      locacao_id: locacao.id,
      criado_em: new Date().toISOString()
    });
    console.log('✅ Transação criada');

    console.log('🎉 Dados de locação criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar dados:', error);
  }
}

seedLocacoes();
