'use client';

import { useState, useEffect } from 'react';
import { Clock, Gift, Sparkles, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Promocao {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  ativa: boolean;
}

export default function Promocoes() {
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState<Record<string, { days: number; hours: number; minutes: number; seconds: number }>>({});

  useEffect(() => {
    fetch('/api/promocoes')
      .then(res => res.json())
      .then(data => {
        setPromocoes(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar promoções:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: Record<string, { days: number; hours: number; minutes: number; seconds: number }> = {};
      
      promocoes.forEach(promocao => {
        const fim = new Date(promocao.data_fim);
        const agora = new Date();
        const diff = fim.getTime() - agora.getTime();
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          newCountdowns[promocao.id] = { days, hours, minutes, seconds };
        }
      });
      
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [promocoes]);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-orange-500 via-primary-yellow-500 to-primary-orange-600 py-16">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Promoções Especiais
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Aproveite ofertas exclusivas e economize na festa dos seus sonhos!
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-soft h-96 animate-pulse" />
            ))}
          </div>
        ) : promocoes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-soft">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-secondary-gray-900 mb-2">
              Nenhuma promoção ativa no momento
            </h3>
            <p className="text-secondary-gray-600 mb-6">
              Fique de olho, novidades em breve!
            </p>
            <a
              href="/catalogo"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-blue-500 text-white rounded-xl font-semibold hover:bg-primary-blue-600 transition-colors"
            >
              Ver Catálogo
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {promocoes.map((promocao, index) => {
              const countdown = countdowns[promocao.id];
              return (
                <div
                  key={promocao.id}
                  className="hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-primary-orange-500 to-primary-yellow-500 p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <h2 className="text-3xl font-bold text-white leading-tight">
                            {promocao.titulo}
                          </h2>
                          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-white text-sm font-semibold">Ativa</span>
                          </div>
                        </div>

                        {/* Countdown */}
                        {countdown && (
                          <div className="flex gap-3 mt-6">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                              <div className="text-2xl font-bold text-white">{countdown.days}</div>
                              <div className="text-xs text-white/80">Dias</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                              <div className="text-2xl font-bold text-white">{countdown.hours}</div>
                              <div className="text-xs text-white/80">Horas</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                              <div className="text-2xl font-bold text-white">{countdown.minutes}</div>
                              <div className="text-xs text-white/80">Min</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                              <div className="text-2xl font-bold text-white">{countdown.seconds}</div>
                              <div className="text-xs text-white/80">Seg</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <p className="text-lg text-secondary-gray-700 mb-6 leading-relaxed">
                        {promocao.descricao}
                      </p>

                      <div className="flex items-center justify-between mb-6 text-sm text-secondary-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            De {formatarData(promocao.data_inicio)} até {formatarData(promocao.data_fim)}
                          </span>
                        </div>
                      </div>

                      <a
                        href="https://wa.me/5555997302463"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-3 w-full bg-primary-green-500 text-white py-4 rounded-xl font-semibold hover:bg-primary-green-600 transition-colors hover:scale-102 transition-transform"
                      >
                        <Phone className="w-5 h-5" />
                        Aproveitar Oferta
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
