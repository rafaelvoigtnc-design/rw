import { NextResponse } from 'next/server';
import { doc, updateDoc, deleteDoc, getDocs, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const docRef = doc(db, 'banners', id);
    await updateDoc(docRef, {
      ...body,
      atualizado_em: new Date().toISOString(),
    });

    return NextResponse.json({ id, ...body });
  } catch (error) {
    console.error('Erro ao atualizar banner:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const docRef = doc(db, 'banners', id);
    await deleteDoc(docRef);

    // Verificar se ficou menos de 3 banners e recriar padrão se necessário
    const snapshot = await getDocs(collection(db, 'banners'));
    if (snapshot.size < 3) {
      console.log('Menos de 3 banners, recriando padrão...');
      const defaultBanners = [
        {
          titulo: 'Diversão Garantida para sua Festa!',
          subtitulo: 'Locação de brinquedos, infláveis, decoração e itens para festas',
          descricao: 'Transforme seu evento em uma experiência inesquecível com nossos brinquedos e serviços premium.',
          botao_primario: 'Solicitar Orçamento',
          link_primario: '/catalogo',
          botao_secundario: 'Ver Catálogo',
          link_secundario: '/catalogo',
          gradiente: 'from-primary-blue-400 via-primary-blue-500 to-primary-green-400',
          imagem: '/logo-sem-fundo.png',
          badge: null,
          ativo: true,
          ordem: 1,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        },
        {
          titulo: 'Combo Família',
          subtitulo: '2 brinquedos com 10% OFF',
          descricao: 'Aproveite nossa promoção exclusiva do mês e economize na festa dos seus filhos!',
          botao_primario: 'Quero Aproveitar',
          link_primario: '/promocoes',
          botao_secundario: 'Ver Detalhes',
          link_secundario: '/promocoes',
          gradiente: 'from-primary-yellow-400 via-primary-orange-400 to-primary-orange-500',
          imagem: '/logo-sem-fundo.png',
          badge: 'Promoção do Mês',
          ativo: true,
          ordem: 2,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        },
        {
          titulo: 'Transformamos sua festa em uma experiência inesquecível',
          subtitulo: 'Aniversários, decorações, mesas e personagens',
          descricao: 'Serviços completos para eventos memoráveis com qualidade e segurança.',
          botao_primario: 'Conhecer Serviços',
          link_primario: '/sobre',
          botao_secundario: 'Ver Galeria',
          link_secundario: '/depoimentos',
          gradiente: 'from-primary-green-400 via-primary-blue-400 to-primary-blue-500',
          imagem: '/logo-sem-fundo.png',
          badge: null,
          ativo: true,
          ordem: 3,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        },
      ];

      for (const banner of defaultBanners) {
        await addDoc(collection(db, 'banners'), banner);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir banner:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir banner' },
      { status: 500 }
    );
  }
}
