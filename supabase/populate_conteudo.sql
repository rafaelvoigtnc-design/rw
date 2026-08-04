-- Popular conteúdo existente das páginas

-- Conteúdo da página Home
INSERT INTO conteudo_pagina (id, pagina, chave, valor, tipo, atualizado_em) VALUES
('home_hero_title', 'home', 'hero_title', 'Diversão Garantida para sua Festa!', 'texto', NOW()),
('home_hero_subtitle', 'home', 'hero_subtitle', 'Locação de brinquedos, infláveis, decoração e itens para festas', 'texto', NOW()),
('home_hero_description', 'home', 'hero_description', 'Transforme seu evento em uma experiência inesquecível com nossos brinquedos e serviços premium.', 'texto', NOW()),
('home_diferencial_1_title', 'home', 'diferencial_1_title', 'Entrega e Montagem', 'texto', NOW()),
('home_diferencial_1_desc', 'home', 'diferencial_1_description', 'Entregamos e montamos tudo no local do seu evento', 'texto', NOW()),
('home_diferencial_2_title', 'home', 'diferencial_2_title', 'Higienização Garantida', 'texto', NOW()),
('home_diferencial_2_desc', 'home', 'diferencial_2_description', 'Todos os brinquedos são higienizados após cada uso', 'texto', NOW()),
('home_diferencial_3_title', 'home', 'diferencial_3_title', 'Segurança Total', 'texto', NOW()),
('home_diferencial_3_desc', 'home', 'diferencial_3_description', 'Equipamentos certificados e seguros para crianças', 'texto', NOW()),
('home_diferencial_4_title', 'home', 'diferencial_4_title', 'Atendimento Premium', 'texto', NOW()),
('home_diferencial_4_desc', 'home', 'diferencial_4_description', 'Equipe dedicada para tornar sua festa especial', 'texto', NOW()),
('home_featured_title', 'home', 'featured_title', 'Os favoritos da criançada', 'texto', NOW()),
('home_featured_subtitle', 'home', 'featured_subtitle', 'Os mais alugados e queridos pelos nossos clientes', 'texto', NOW()),
('home_how_title', 'home', 'how_title', 'Como funciona', 'texto', NOW()),
('home_how_subtitle', 'home', 'how_subtitle', 'Em 4 passos simples, você transforma sua festa', 'texto', NOW()),
('home_testimonials_title', 'home', 'testimonials_title', 'O que nossos clientes dizem', 'texto', NOW()),
('home_testimonials_subtitle', 'home', 'testimonials_subtitle', 'Depoimentos reais de quem já aproveitou nossos serviços', 'texto', NOW()),
('home_cta_title', 'home', 'cta_title', 'Pronto para planejar sua festa?', 'texto', NOW()),
('home_cta_subtitle', 'home', 'cta_subtitle', 'Entre em contato conosco e vamos juntos criar uma experiência inesquecível!', 'texto', NOW()),
('home_whatsapp_title', 'home', 'whatsapp_title', 'Ainda ficou com dúvidas?', 'texto', NOW()),
('home_whatsapp_subtitle', 'home', 'whatsapp_subtitle', 'Fale diretamente com nossa equipe pelo WhatsApp', 'texto', NOW())
ON CONFLICT (id) DO NOTHING;

-- Conteúdo da página Sobre
INSERT INTO conteudo_pagina (id, pagina, chave, valor, tipo, atualizado_em) VALUES
('sobre_hero_title', 'sobre', 'hero_title', 'Sobre a RW Brinquedos', 'texto', NOW()),
('sobre_hero_subtitle', 'sobre', 'hero_subtitle', 'Transformando festas em momentos inesquecíveis desde o início. Nossa paixão é proporcionar diversão segura e de qualidade para crianças de todas as idades.', 'texto', NOW()),
('sobre_history_title', 'sobre', 'history_title', 'Nossa História', 'texto', NOW()),
('sobre_history_p1', 'sobre', 'history_p1', 'A RW Brinquedos nasceu do sonho de transformar festas em momentos inesquecíveis. Começamos como uma pequena iniciativa familiar e hoje nos orgulhamos de ser referência em locação de brinquedos e itens para festas na região.', 'texto', NOW()),
('sobre_history_p2', 'sobre', 'history_p2', 'Com anos de experiência, entendemos que cada evento é único e merece atenção especial. Nossa missão é proporcionar diversão segura e de qualidade para crianças de todas as idades.', 'texto', NOW()),
('sobre_history_p3', 'sobre', 'history_p3', 'Trabalhamos com materiais de alta qualidade, realizamos manutenções periódicas em todos os nossos equipamentos e contamos com uma equipe dedicada a garantir a segurança e o bem-estar dos pequenos.', 'texto', NOW()),
('sobre_mission_title', 'sobre', 'mission_title', 'Nossa Missão', 'texto', NOW()),
('sobre_mission_desc', 'sobre', 'mission_description', 'Proporcionar diversão segura e de qualidade para crianças de todas as idades, transformando cada festa em uma experiência inesquecível e cheia de alegria.', 'texto', NOW()),
('sobre_vision_title', 'sobre', 'vision_title', 'Nossa Visão', 'texto', NOW()),
('sobre_vision_desc', 'sobre', 'vision_description', 'Ser referência regional em locação de brinquedos e itens para festas, reconhecidos pela qualidade, segurança e excelência no atendimento.', 'texto', NOW()),
('sobre_values_title', 'sobre', 'values_title', 'Nossos Valores', 'texto', NOW()),
('sobre_values_subtitle', 'sobre', 'values_subtitle', 'Os princípios que guiam nosso trabalho', 'texto', NOW()),
('sobre_value_1_title', 'sobre', 'value_1_title', 'Segurança', 'texto', NOW()),
('sobre_value_1_desc', 'sobre', 'value_1_description', 'A segurança das crianças é nossa prioridade absoluta. Todos os equipamentos passam por rigorosos testes.', 'texto', NOW()),
('sobre_value_2_title', 'sobre', 'value_2_title', 'Qualidade', 'texto', NOW()),
('sobre_value_2_desc', 'sobre', 'value_2_description', 'Brinquedos e equipamentos de alta qualidade, sempre limpos e bem conservados.', 'texto', NOW()),
('sobre_value_3_title', 'sobre', 'value_3_title', 'Pontualidade', 'texto', NOW()),
('sobre_value_3_desc', 'sobre', 'value_3_description', 'Respeitamos os horários combinados e garantimos a entrega no momento acordado.', 'texto', NOW()),
('sobre_value_4_title', 'sobre', 'value_4_title', 'Atendimento', 'texto', NOW()),
('sobre_value_4_desc', 'sobre', 'value_4_description', 'Cada cliente é único e merece atenção especial para que seu evento seja perfeito.', 'texto', NOW()),
('sobre_cta_title', 'sobre', 'cta_title', 'Pronto para criar memórias inesquecíveis?', 'texto', NOW()),
('sobre_cta_subtitle', 'sobre', 'cta_subtitle', 'Entre em contato conosco e vamos juntos planejar a festa perfeita!', 'texto', NOW()),
('sobre_foto_equipe', 'sobre', 'foto_equipe', '', 'imagem', NOW())
ON CONFLICT (id) DO NOTHING;

-- Conteúdo da página Contato
INSERT INTO conteudo_pagina (id, pagina, chave, valor, tipo, atualizado_em) VALUES
('contato_hero_title', 'contato', 'hero_title', 'Entre em Contato', 'texto', NOW()),
('contato_hero_subtitle', 'contato', 'hero_subtitle', 'Estamos aqui para ajudar você a planejar a festa perfeita. Entre em contato conosco!', 'texto', NOW()),
('contato_whatsapp', 'contato', 'whatsapp', '(55) 99730-2463', 'texto', NOW()),
('contato_email', 'contato', 'email', 'rwbrinquedos@gmail.com', 'texto', NOW()),
('contato_location', 'contato', 'location', 'Nova Candelaria e Região', 'texto', NOW()),
('contato_instagram', 'contato', 'instagram', '@rwbrinquedos', 'texto', NOW())
ON CONFLICT (id) DO NOTHING;
