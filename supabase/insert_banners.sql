-- Limpar tabela banners primeiro
DELETE FROM banners;

-- Inserir banners originais
INSERT INTO banners (id, titulo, subtitulo, descricao, botao_primario, link_primario, botao_secundario, link_secundario, gradiente, imagem, badge, ativo, ordem) VALUES
('1', 'Diversão Garantida para sua Festa!', 'Locação de brinquedos, infláveis, decoração e itens para festas', 'Transforme seu evento em uma experiência inesquecível com nossos brinquedos e serviços premium.', 'Solicitar Orçamento', '/catalogo', 'Ver Catálogo', '/catalogo', 'from-primary-blue-400 via-primary-blue-500 to-primary-green-400', '/logo-sem-fundo.png', NULL, true, 0),
('2', 'Combo Família', '2 brinquedos com 10% OFF', 'Aproveite nossa promoção exclusiva do mês e economize na festa dos seus filhos!', 'Quero Aproveitar', '/promocoes', 'Ver Detalhes', '/promocoes', 'from-primary-yellow-400 via-primary-orange-400 to-primary-orange-500', '/logo-sem-fundo.png', 'Promoção do Mês', true, 1),
('3', 'Transformamos sua festa em uma experiência inesquecível', 'Aniversários, decorações, mesas e personagens', 'Serviços completos para eventos memoráveis com qualidade e segurança.', 'Conhecer Serviços', '/sobre', 'Ver Galeria', '/depoimentos', 'from-primary-green-400 via-primary-blue-400 to-primary-blue-500', '/logo-sem-fundo.png', NULL, true, 2);
