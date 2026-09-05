import { PrismaClient } from '@prisma/client';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const prisma = new PrismaClient();

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

async function migrateData() {
  console.log('🚀 Iniciando migração para Firebase...');

  try {
    // Migrar Categorias
    console.log('📦 Migrando Categorias...');
    const categorias = await prisma.categoria.findMany();
    for (const cat of categorias) {
      await addDoc(collection(db, 'categorias'), {
        id: cat.id,
        nome: cat.nome,
        icone: cat.icone
      });
    }
    console.log(`✅ ${categorias.length} categorias migradas`);

    // Migrar Brinquedos
    console.log('🧸 Migrando Brinquedos...');
    const brinquedos = await prisma.brinquedo.findMany();
    for (const brinq of brinquedos) {
      await addDoc(collection(db, 'brinquedos'), {
        id: brinq.id,
        nome: brinq.nome,
        categoria_id: brinq.categoria_id,
        descricao: brinq.descricao,
        fotos: brinq.fotos,
        dimensoes: brinq.dimensoes,
        faixa_etaria: brinq.faixa_etaria,
        preco_periodo: brinq.preco_periodo,
        status: brinq.status,
        tema_layout: brinq.tema_layout,
        mostrar_home: brinq.mostrar_home,
        criado_em: brinq.criado_em.toISOString()
      });
    }
    console.log(`✅ ${brinquedos.length} brinquedos migrados`);

    // Migrar Promoções
    console.log('🎁 Migrando Promoções...');
    const promocoes = await prisma.promocao.findMany();
    for (const prom of promocoes) {
      await addDoc(collection(db, 'promocoes'), {
        id: prom.id,
        titulo: prom.titulo,
        descricao: prom.descricao,
        data_inicio: prom.data_inicio.toISOString(),
        data_fim: prom.data_fim.toISOString(),
        ativa: prom.ativa,
        criado_em: prom.criado_em.toISOString()
      });
    }
    console.log(`✅ ${promocoes.length} promoções migradas`);

    // Migrar Banners
    console.log('🖼️ Migrando Banners...');
    const banners = await prisma.banner.findMany();
    for (const banner of banners) {
      await addDoc(collection(db, 'banners'), {
        id: banner.id,
        titulo: banner.titulo,
        subtitulo: banner.subtitulo,
        descricao: banner.descricao,
        botao_primario: banner.botao_primario,
        link_primario: banner.link_primario,
        botao_secundario: banner.botao_secundario,
        link_secundario: banner.link_secundario,
        gradiente: banner.gradiente,
        imagem: banner.imagem,
        badge: banner.badge,
        ativo: banner.ativo,
        ordem: banner.ordem,
        criado_em: banner.criado_em.toISOString(),
        atualizado_em: banner.atualizado_em.toISOString()
      });
    }
    console.log(`✅ ${banners.length} banners migrados`);

    // Migrar Clientes
    console.log('👤 Migrando Clientes...');
    const clientes = await prisma.cliente.findMany();
    for (const cliente of clientes) {
      await addDoc(collection(db, 'clientes'), {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        senha_hash: cliente.senha_hash,
        endereco: cliente.endereco,
        criado_em: cliente.criado_em.toISOString()
      });
    }
    console.log(`✅ ${clientes.length} clientes migrados`);

    // Migrar Avaliações
    console.log('⭐ Migrando Avaliações...');
    const avaliacoes = await prisma.avaliacao.findMany();
    for (const aval of avaliacoes) {
      await addDoc(collection(db, 'avaliacoes'), {
        id: aval.id,
        cliente_id: aval.cliente_id,
        texto: aval.texto,
        nota: aval.nota,
        foto: aval.foto,
        aprovado_para_exibir: aval.aprovado_para_exibir,
        criado_em: aval.criado_em.toISOString()
      });
    }
    console.log(`✅ ${avaliacoes.length} avaliações migradas`);

    // Migrar Admins
    console.log('🔐 Migrando Admins...');
    const admins = await prisma.usuarioAdmin.findMany();
    for (const admin of admins) {
      await addDoc(collection(db, 'admins'), {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        senha_hash: admin.senha_hash,
        criado_em: admin.criado_em.toISOString()
      });
    }
    console.log(`✅ ${admins.length} admins migrados`);

    console.log('🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
