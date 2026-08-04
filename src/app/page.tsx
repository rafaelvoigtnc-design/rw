import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BrinquedosDestaque from '@/components/BrinquedosDestaque';
import PromocaoBanner from '@/components/PromocaoBanner';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import HeroCarousel from '@/components/HeroCarousel';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Diferenciais */}
      <ScrollAnimation direction="up" delay={0.1}>
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                {
                  icon: '🚚',
                  title: 'Entrega e Montagem',
                  description: 'Entregamos e montamos tudo no local do seu evento',
                  color: 'bg-primary-blue-100',
                },
                {
                  icon: '✨',
                  title: 'Higienização Garantida',
                  description: 'Todos os brinquedos são higienizados após cada uso',
                  color: 'bg-primary-green-100',
                },
                {
                  icon: '🛡️',
                  title: 'Segurança Total',
                  description: 'Equipamentos certificados e seguros para crianças',
                  color: 'bg-primary-orange-100',
                },
                {
                  icon: '💬',
                  title: 'Atendimento Premium',
                  description: 'Equipe dedicada para tornar sua festa especial',
                  color: 'bg-primary-yellow-100',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 md:p-8 rounded-2xl bg-white shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 cursor-pointer hover:scale-102"
                >
                  <div className={`w-12 h-12 md:w-16 md:h-16 ${item.color} rounded-2xl flex items-center justify-center mb-3 md:mb-6`}>
                    <span className="text-2xl md:text-3xl">{item.icon}</span>
                  </div>
                  <h3 className="text-sm md:text-xl font-bold text-secondary-gray-900 mb-1 md:mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-base text-secondary-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Promoção Banner */}
      <ScrollAnimation direction="left" delay={0.2}>
        <PromocaoBanner />
      </ScrollAnimation>

      {/* Brinquedos em Destaque */}
      <ScrollAnimation direction="up" delay={0.3}>
        <section className="py-20 bg-gray-50">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-secondary-gray-900 mb-4">
                Os favoritos da criançada
              </h2>
              <p className="text-lg text-secondary-gray-600">
                Os mais alugados e queridos pelos nossos clientes
              </p>
            </div>
            <BrinquedosDestaque />
          </div>
        </section>
      </ScrollAnimation>

      {/* Como Funciona */}
      <ScrollAnimation direction="right" delay={0.4}>
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-secondary-gray-900 mb-2 md:mb-4">
                Como funciona
              </h2>
              <p className="text-sm md:text-lg text-secondary-gray-600">
                Em 4 passos simples, você transforma sua festa
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                {
                  step: '1',
                  title: 'Escolha',
                  description: 'Selecione os brinquedos e itens para sua festa',
                  icon: '🎯',
                },
                {
                  step: '2',
                  title: 'Solicite orçamento',
                  description: 'Entre em contato e solicite um orçamento personalizado',
                  icon: '💰',
                },
                {
                  step: '3',
                  title: 'Agende',
                  description: 'Defina a data e horário do seu evento',
                  icon: '📅',
                },
                {
                  step: '4',
                  title: 'Receba na festa',
                  description: 'Nossa equipe entrega e monta tudo para você',
                  icon: '🎉',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="relative"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto mb-3 md:mb-4 lg:mb-6 rounded-full bg-gradient-to-br from-primary-blue-500 to-primary-green-500 flex items-center justify-center text-white text-xl md:text-2xl lg:text-3xl font-bold shadow-soft">
                      {item.step}
                    </div>
                    <div className="text-2xl md:text-3xl lg:text-4xl mb-2 md:mb-3 lg:mb-4">{item.icon}</div>
                    <h3 className="text-sm md:text-base lg:text-xl font-bold text-secondary-gray-900 mb-1 md:mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[10px] md:text-sm lg:text-base text-secondary-gray-600">
                      {item.description}
                    </p>
                  </div>

                  {index < 3 && (
                    <div className="hidden lg:block absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-0.5 bg-gradient-to-r from-primary-blue-200 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Depoimentos */}
      <ScrollAnimation direction="up" delay={0.5}>
        <section className="py-20 bg-gray-50">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-secondary-gray-900 mb-4">
                O que nossos clientes dizem
              </h2>
              <p className="text-lg text-secondary-gray-600">
                Depoimentos reais de quem já aproveitou nossos serviços
              </p>
            </div>
            <TestimonialsCarousel />
          </div>
        </section>
      </ScrollAnimation>

      {/* CTA Section */}
      <ScrollAnimation direction="down" delay={0.6}>
        <section className="py-12 md:py-20 bg-gradient-to-r from-primary-green-500 to-primary-blue-500 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="max-w-[1440px] mx-auto px-6 text-center relative z-10">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
            Pronto para planejar sua festa?
          </h2>
          <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e vamos juntos criar uma experiência inesquecível!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <a
              href="https://wa.me/5555997302463?text=Olá! Gostaria de saber mais sobre os serviços da RW Brinquedos para minha festa."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-full bg-white text-primary-green-600 font-semibold text-sm md:text-lg hover:bg-gray-100 transition-colors shadow-lg hover:scale-105"
            >
              Falar no WhatsApp
            </a>
            <a
              href="/catalogo"
              className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold text-sm md:text-lg hover:bg-white/30 transition-colors border-2 border-white/30 hover:scale-105"
            >
              Ver Catálogo Completo
            </a>
          </div>
        </div>
      </section>
      </ScrollAnimation>

      {/* WhatsApp Banner */}
      <ScrollAnimation direction="up" delay={0.7}>
        <section className="py-12 md:py-16 bg-primary-green-500">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center animate-pulse">
                <span className="text-3xl md:text-4xl">💬</span>
              </div>
              <div className="text-white">
                <h3 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Ainda ficou com dúvidas?</h3>
                <p className="text-sm md:text-lg opacity-90">
                  Fale diretamente com nossa equipe pelo WhatsApp
                </p>
              </div>
            </div>
            
            <a
              href="https://wa.me/5555997302463?text=Olá! Gostaria de tirar algumas dúvidas sobre os serviços da RW Brinquedos."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-full bg-white text-primary-green-600 font-semibold text-sm md:text-lg hover:bg-gray-100 transition-colors shadow-lg hover:scale-105"
            >
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>
      </ScrollAnimation>

      <Footer />
    </div>
  );
}
