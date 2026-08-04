'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, Shield, Clock, Users, Target, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sobre() {
  const [fotoEquipe, setFotoEquipe] = useState('');

  useEffect(() => {
    fetch('/api/conteudo?pagina=sobre&chave=foto_equipe')
      .then(res => res.json())
      .then(data => {
        if (data && data.valor) {
          setFotoEquipe(data.valor);
        }
      })
      .catch(error => console.error('Erro ao buscar foto da equipe:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-blue-500 via-primary-green-500 to-primary-blue-600 py-20">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Sobre a RW Brinquedos
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Transformando festas em momentos inesquecíveis desde o início. Nossa paixão é proporcionar diversão segura e de qualidade para crianças de todas as idades.
              </p>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="w-80 h-80 bg-white/20 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
                <img
                  src="/logo-sem-fundo.png"
                  alt="RW Brinquedos"
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 py-16">
        {/* Nossa História */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl shadow-soft p-8">
              <h2 className="text-3xl font-bold text-secondary-gray-900 mb-6">Nossa História</h2>
              <div className="space-y-4 text-secondary-gray-700 leading-relaxed">
                <p>
                  A RW Brinquedos nasceu do sonho de transformar festas em momentos inesquecíveis. Começamos como uma pequena iniciativa familiar e hoje nos orgulhamos de ser referência em locação de brinquedos e itens para festas na região.
                </p>
                <p>
                  Com anos de experiência, entendemos que cada evento é único e merece atenção especial. Nossa missão é proporcionar diversão segura e de qualidade para crianças de todas as idades.
                </p>
                <p>
                  Trabalhamos com materiais de alta qualidade, realizamos manutenções periódicas em todos os nossos equipamentos e contamos com uma equipe dedicada a garantir a segurança e o bem-estar dos pequenos.
                </p>
              </div>
            </div>
            {fotoEquipe ? (
              <div className="bg-gradient-to-br from-primary-blue-100 to-primary-green-100 rounded-2xl h-96 overflow-hidden">
                <img
                  src={fotoEquipe}
                  alt="Nossa Equipe"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary-blue-100 to-primary-green-100 rounded-2xl h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                  <p className="text-secondary-gray-600 font-medium">Nossa Equipe</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Missão e Visão */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-soft p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-primary-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-gray-900 mb-4">Nossa Missão</h3>
              <p className="text-secondary-gray-700 leading-relaxed">
                Proporcionar diversão segura e de qualidade para crianças de todas as idades, transformando cada festa em uma experiência inesquecível e cheia de alegria.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-primary-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-primary-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-gray-900 mb-4">Nossa Visão</h3>
              <p className="text-secondary-gray-700 leading-relaxed">
                Ser referência regional em locação de brinquedos e itens para festas, reconhecidos pela qualidade, segurança e excelência no atendimento.
              </p>
            </div>
          </div>
        </section>

        {/* Nossos Valores */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-secondary-gray-900 mb-4">Nossos Valores</h2>
            <p className="text-lg text-secondary-gray-600">
              Os princípios que guiam nosso trabalho
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Segurança',
                description: 'A segurança das crianças é nossa prioridade absoluta. Todos os equipamentos passam por rigorosos testes.',
                color: 'bg-red-100',
                iconColor: 'text-red-600',
              },
              {
                icon: Heart,
                title: 'Qualidade',
                description: 'Brinquedos e equipamentos de alta qualidade, sempre limpos e bem conservados.',
                color: 'bg-pink-100',
                iconColor: 'text-pink-600',
              },
              {
                icon: Clock,
                title: 'Pontualidade',
                description: 'Respeitamos os horários combinados e garantimos a entrega no momento acordado.',
                color: 'bg-blue-100',
                iconColor: 'text-blue-600',
              },
              {
                icon: Users,
                title: 'Atendimento',
                description: 'Cada cliente é único e merece atenção especial para que seu evento seja perfeito.',
                color: 'bg-green-100',
                iconColor: 'text-green-600',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-soft p-6 text-center hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-secondary-gray-900 mb-3">{item.title}</h3>
                <p className="text-secondary-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary-green-500 to-primary-blue-500 rounded-2xl p-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Pronto para criar memórias inesquecíveis?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e vamos juntos planejar a festa perfeita!
          </p>
          <a
            href="https://wa.me/5555997302463?text=Olá! Gostaria de saber mais sobre a RW Brinquedos e seus serviços."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-green-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors hover:scale-105 transition-transform"
          >
            Falar no WhatsApp
          </a>
        </section>
      </div>

      <Footer />
    </div>
  );
}
