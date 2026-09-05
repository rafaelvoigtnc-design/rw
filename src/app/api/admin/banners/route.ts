import { NextResponse } from 'next/server';
import { getAllBanners, createBanner } from '@/lib/firebase-db';

export async function GET(request: Request) {
  try {
    console.log('Buscando banners do Firebase (admin)...');
    const banners = await getAllBanners();

    // Se não houver banners, criar banners padrão
    if (banners.length === 0) {
      console.log('Nenhum banner encontrado, criando banners padrão...');
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
        },
      ];

      for (const banner of defaultBanners) {
        await createBanner(banner);
      }

      // Buscar novamente após criar
      const newBanners = await getAllBanners();
      console.log(`Criados e retornando ${newBanners.length} banners (admin)`);
      return NextResponse.json(newBanners);
    }

    console.log(`Retornando ${banners.length} banners (admin)`);
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Erro ao buscar banners (admin):', error);
    return NextResponse.json(
      { error: 'Erro ao buscar banners', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Buscar maior ordem atual
    const banners = await getAllBanners();
    const novaOrdem = banners.length > 0 ? Math.max(...banners.map((b: any) => b.ordem || 0)) + 1 : 0;

    const data = await createBanner({
      ...body,
      ordem: body.ordem !== undefined ? body.ordem : novaOrdem,
    });

    return NextResponse.json({ id: data.id, ...body, ordem: body.ordem !== undefined ? body.ordem : novaOrdem });
  } catch (error) {
    console.error('Erro ao criar banner:', error);
    return NextResponse.json(
      { error: 'Erro ao criar banner' },
      { status: 500 }
    );
  }
}
