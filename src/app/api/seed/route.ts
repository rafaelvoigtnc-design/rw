import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log('Iniciando seed do banco de dados...');

    // Limpar tabelas primeiro
    await supabase.from('banners').delete().neq('id', '00000');
    await supabase.from('conteudo_pagina').delete().neq('id', '00000');

    // Inserir banners
    const banners = [
      {
        id: '1',
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
        ordem: 0,
      },
      {
        id: '2',
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
        ordem: 1,
      },
      {
        id: '3',
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
        ordem: 2,
      },
    ];

    const { error: bannersError } = await supabase.from('banners').insert(banners);
    if (bannersError) throw bannersError;
    console.log('Banners inseridos com sucesso');

    // Inserir conteúdo
    const conteudos = [
      // Home
      { id: 'home_hero_title', pagina: 'home', chave: 'hero_title', valor: 'Diversão Garantida para sua Festa!', tipo: 'texto' },
      { id: 'home_hero_subtitle', pagina: 'home', chave: 'hero_subtitle', valor: 'Locação de brinquedos, infláveis, decoração e itens para festas', tipo: 'texto' },
      { id: 'home_hero_description', pagina: 'home', chave: 'hero_description', valor: 'Transforme seu evento em uma experiência inesquecível com nossos brinquedos e serviços premium.', tipo: 'texto' },
      { id: 'home_dif_1_icon', pagina: 'home', chave: 'diferencial_1_icon', valor: 'Truck', tipo: 'icone' },
      { id: 'home_dif_1_title', pagina: 'home', chave: 'diferencial_1_title', valor: 'Entrega e Montagem', tipo: 'texto' },
      { id: 'home_dif_1_desc', pagina: 'home', chave: 'diferencial_1_description', valor: 'Entregamos e montamos tudo no local do seu evento', tipo: 'texto' },
      { id: 'home_dif_2_icon', pagina: 'home', chave: 'diferencial_2_icon', valor: 'Sparkles', tipo: 'icone' },
      { id: 'home_dif_2_title', pagina: 'home', chave: 'diferencial_2_title', valor: 'Higienização Garantida', tipo: 'texto' },
      { id: 'home_dif_2_desc', pagina: 'home', chave: 'diferencial_2_description', valor: 'Todos os brinquedos são higienizados após cada uso', tipo: 'texto' },
      { id: 'home_dif_3_icon', pagina: 'home', chave: 'diferencial_3_icon', valor: 'Shield', tipo: 'icone' },
      { id: 'home_dif_3_title', pagina: 'home', chave: 'diferencial_3_title', valor: 'Segurança Total', tipo: 'texto' },
      { id: 'home_dif_3_desc', pagina: 'home', chave: 'diferencial_3_description', valor: 'Equipamentos certificados e seguros para crianças', tipo: 'texto' },
      { id: 'home_dif_4_icon', pagina: 'home', chave: 'diferencial_4_icon', valor: 'Users', tipo: 'icone' },
      { id: 'home_dif_4_title', pagina: 'home', chave: 'diferencial_4_title', valor: 'Atendimento Premium', tipo: 'texto' },
      { id: 'home_dif_4_desc', pagina: 'home', chave: 'diferencial_4_description', valor: 'Equipe dedicada para tornar sua festa especial', tipo: 'texto' },
      { id: 'home_featured_title', pagina: 'home', chave: 'featured_title', valor: 'Os favoritos da criançada', tipo: 'texto' },
      { id: 'home_featured_subtitle', pagina: 'home', chave: 'featured_subtitle', valor: 'Os mais alugados e queridos pelos nossos clientes', tipo: 'texto' },
      { id: 'home_how_title', pagina: 'home', chave: 'how_title', valor: 'Como funciona', tipo: 'texto' },
      { id: 'home_how_subtitle', pagina: 'home', chave: 'how_subtitle', valor: 'Em 4 passos simples, você transforma sua festa', tipo: 'texto' },
      { id: 'home_testimonials_title', pagina: 'home', chave: 'testimonials_title', valor: 'O que nossos clientes dizem', tipo: 'texto' },
      { id: 'home_testimonials_subtitle', pagina: 'home', chave: 'testimonials_subtitle', valor: 'Depoimentos reais de quem já aproveitou nossos serviços', tipo: 'texto' },
      { id: 'home_cta_title', pagina: 'home', chave: 'cta_title', valor: 'Pronto para planejar sua festa?', tipo: 'texto' },
      { id: 'home_cta_subtitle', pagina: 'home', chave: 'cta_subtitle', valor: 'Entre em contato conosco e vamos juntos criar uma experiência inesquecível!', tipo: 'texto' },
      { id: 'home_whatsapp_title', pagina: 'home', chave: 'whatsapp_title', valor: 'Ainda ficou com dúvidas?', tipo: 'texto' },
      { id: 'home_whatsapp_subtitle', pagina: 'home', chave: 'whatsapp_subtitle', valor: 'Fale diretamente com nossa equipe pelo WhatsApp', tipo: 'texto' },

      // Sobre
      { id: 'sobre_hero_title', pagina: 'sobre', chave: 'hero_title', valor: 'Sobre a RW Brinquedos', tipo: 'texto' },
      { id: 'sobre_hero_subtitle', pagina: 'sobre', chave: 'hero_subtitle', valor: 'Transformando festas em momentos inesquecíveis desde o início. Nossa paixão é proporcionar diversão segura e de qualidade para crianças de todas as idades.', tipo: 'texto' },
      { id: 'sobre_history_title', pagina: 'sobre', chave: 'history_title', valor: 'Nossa História', tipo: 'texto' },
      { id: 'sobre_history_p1', pagina: 'sobre', chave: 'history_p1', valor: 'A RW Brinquedos nasceu do sonho de transformar festas em momentos inesquecíveis. Começamos como uma pequena iniciativa familiar e hoje nos orgulhamos de ser referência em locação de brinquedos e itens para festas na região.', tipo: 'texto' },
      { id: 'sobre_history_p2', pagina: 'sobre', chave: 'history_p2', valor: 'Com anos de experiência, entendemos que cada evento é único e merece atenção especial. Nossa missão é proporcionar diversão segura e de qualidade para crianças de todas as idades.', tipo: 'texto' },
      { id: 'sobre_history_p3', pagina: 'sobre', chave: 'history_p3', valor: 'Trabalhamos com materiais de alta qualidade, realizamos manutenções periódicas em todos os nossos equipamentos e contamos com uma equipe dedicada a garantir a segurança e o bem-estar dos pequenos.', tipo: 'texto' },
      { id: 'sobre_mission_title', pagina: 'sobre', chave: 'mission_title', valor: 'Nossa Missão', tipo: 'texto' },
      { id: 'sobre_mission_desc', pagina: 'sobre', chave: 'mission_description', valor: 'Proporcionar diversão segura e de qualidade para crianças de todas as idades, transformando cada festa em uma experiência inesquecível e cheia de alegria.', tipo: 'texto' },
      { id: 'sobre_vision_title', pagina: 'sobre', chave: 'vision_title', valor: 'Nossa Visão', tipo: 'texto' },
      { id: 'sobre_vision_desc', pagina: 'sobre', chave: 'vision_description', valor: 'Ser referência regional em locação de brinquedos e itens para festas, reconhecidos pela qualidade, segurança e excelência no atendimento.', tipo: 'texto' },
      { id: 'sobre_values_title', pagina: 'sobre', chave: 'values_title', valor: 'Nossos Valores', tipo: 'texto' },
      { id: 'sobre_values_subtitle', pagina: 'sobre', chave: 'values_subtitle', valor: 'Os princípios que guiam nosso trabalho', tipo: 'texto' },
      { id: 'sobre_val_1_icon', pagina: 'sobre', chave: 'value_1_icon', valor: 'Shield', tipo: 'icone' },
      { id: 'sobre_val_1_title', pagina: 'sobre', chave: 'value_1_title', valor: 'Segurança', tipo: 'texto' },
      { id: 'sobre_val_1_desc', pagina: 'sobre', chave: 'value_1_description', valor: 'A segurança das crianças é nossa prioridade absoluta. Todos os equipamentos passam por rigorosos testes.', tipo: 'texto' },
      { id: 'sobre_val_2_icon', pagina: 'sobre', chave: 'value_2_icon', valor: 'Heart', tipo: 'icone' },
      { id: 'sobre_val_2_title', pagina: 'sobre', chave: 'value_2_title', valor: 'Qualidade', tipo: 'texto' },
      { id: 'sobre_val_2_desc', pagina: 'sobre', chave: 'value_2_description', valor: 'Brinquedos e equipamentos de alta qualidade, sempre limpos e bem conservados.', tipo: 'texto' },
      { id: 'sobre_val_3_icon', pagina: 'sobre', chave: 'value_3_icon', valor: 'Clock', tipo: 'icone' },
      { id: 'sobre_val_3_title', pagina: 'sobre', chave: 'value_3_title', valor: 'Pontualidade', tipo: 'texto' },
      { id: 'sobre_val_3_desc', pagina: 'sobre', chave: 'value_3_description', valor: 'Respeitamos os horários combinados e garantimos a entrega no momento acordado.', tipo: 'texto' },
      { id: 'sobre_val_4_icon', pagina: 'sobre', chave: 'value_4_icon', valor: 'Users', tipo: 'icone' },
      { id: 'sobre_val_4_title', pagina: 'sobre', chave: 'value_4_title', valor: 'Atendimento', tipo: 'texto' },
      { id: 'sobre_val_4_desc', pagina: 'sobre', chave: 'value_4_description', valor: 'Cada cliente é único e merece atenção especial para que seu evento seja perfeito.', tipo: 'texto' },
      { id: 'sobre_cta_title', pagina: 'sobre', chave: 'cta_title', valor: 'Pronto para criar memórias inesquecíveis?', tipo: 'texto' },
      { id: 'sobre_cta_subtitle', pagina: 'sobre', chave: 'cta_subtitle', valor: 'Entre em contato conosco e vamos juntos planejar a festa perfeita!', tipo: 'texto' },
      { id: 'sobre_foto_equipe', pagina: 'sobre', chave: 'foto_equipe', valor: '', tipo: 'imagem' },

      // Contato
      { id: 'contato_hero_title', pagina: 'contato', chave: 'hero_title', valor: 'Entre em Contato', tipo: 'texto' },
      { id: 'contato_hero_subtitle', pagina: 'contato', chave: 'hero_subtitle', valor: 'Estamos aqui para ajudar você a planejar a festa perfeita. Entre em contato conosco!', tipo: 'texto' },
      { id: 'contato_whatsapp', pagina: 'contato', chave: 'whatsapp', valor: '(55) 99730-2463', tipo: 'texto' },
      { id: 'contato_email', pagina: 'contato', chave: 'email', valor: 'rwbrinquedos@gmail.com', tipo: 'texto' },
      { id: 'contato_location', pagina: 'contato', chave: 'location', valor: 'Nova Candelaria e Região', tipo: 'texto' },
      { id: 'contato_instagram', pagina: 'contato', chave: 'instagram', valor: '@rwbrinquedos', tipo: 'texto' },
    ];

    const { error: conteudoError } = await supabase.from('conteudo_pagina').insert(conteudos);
    if (conteudoError) throw conteudoError;
    console.log('Conteúdo inserido com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Dados inseridos com sucesso',
      bannersCount: banners.length,
      conteudoCount: conteudos.length,
    });
  } catch (error) {
    console.error('Erro no seed:', error);
    return NextResponse.json(
      { error: 'Erro no seed', details: String(error) },
      { status: 500 }
    );
  }
}
