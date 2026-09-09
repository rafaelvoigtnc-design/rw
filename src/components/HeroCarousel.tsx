'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Gift, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Banner {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  botao_primario: string;
  link_primario: string;
  botao_secundario: string;
  link_secundario: string;
  gradiente: string;
  imagem: string;
  badge?: string;
  ativo: boolean;
}

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Iniciando listener em tempo real de banners...');
    
    // Usar onSnapshot para atualização em tempo real
    const q = query(
      collection(db, 'banners'),
      where('ativo', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('� Snapshot recebido:', snapshot.docs.length, 'banners');
      
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Ordenar por ordem
      data.sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));
      
      console.log('✅ Banners atualizados em tempo real:', data.length);
      console.log('📋 Lista:', data.map((b: any) => b.titulo));
      
      setBanners(data as Banner[]);
      setLoading(false);
    }, (error) => {
      console.error('❌ Erro no listener de banners:', error);
      setLoading(false);
    });

    return () => {
      console.log('🔌 Desconectando listener de banners');
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
  };

  const [direction, setDirection] = useState(0);

  const handleSlideChange = (newIndex: number) => {
    setDirection(newIndex > currentSlide ? 1 : -1);
    setCurrentSlide(newIndex);
  };

  return (
    <section className="relative w-full h-[500px] md:h-[700px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Decorative Elements - Bolhas apagadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 md:top-20 md:left-20 w-16 h-16 md:w-32 md:h-32 bg-primary-blue-200 rounded-full opacity-10 animate-bounce" />
        <div className="absolute top-20 right-10 md:top-40 md:right-40 w-12 h-12 md:w-24 md:h-24 bg-primary-green-200 rounded-full opacity-10 animate-pulse" />
        <div className="absolute bottom-10 left-1/4 md:bottom-20 md:left-1/3 w-10 h-10 md:w-20 md:h-20 bg-primary-yellow-200 rounded-full opacity-10 animate-bounce" />
        <div className="absolute top-1/3 right-1/4 w-8 h-8 md:w-16 md:h-16 bg-primary-pink-200 rounded-full opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-6 h-6 md:w-12 md:h-12 bg-primary-purple-200 rounded-full opacity-10 animate-bounce" />
        <div className="absolute top-1/2 left-10 w-5 h-5 md:w-10 md:h-10 bg-primary-orange-200 rounded-full opacity-10 animate-pulse" />
        
        {/* Emojis flutuantes */}
        <div className="absolute top-1/4 right-1/3 text-3xl md:text-5xl opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>🎈</div>
        <div className="absolute bottom-1/3 left-1/5 text-2xl md:text-4xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>🎉</div>
        <div className="absolute top-1/2 right-1/5 text-2xl md:text-4xl opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}>🎊</div>
        <div className="absolute bottom-1/4 right-1/3 text-3xl md:text-5xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>🎁</div>
        <div className="absolute top-1/3 left-1/4 text-2xl md:text-4xl opacity-20 animate-bounce" style={{ animationDelay: '2.5s' }}>🎪</div>
      </div>

      {/* Slides */}
      <div className="relative w-full h-full">
        {banners.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-700 mb-4">Nenhum banner disponível</h2>
              <p className="text-gray-600">Crie banners no painel administrativo para exibir aqui.</p>
            </div>
          </div>
        ) : (
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 flex items-center transition-all duration-500 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none scale-95'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradiente} opacity-90`} />
              
              <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                  {/* Left Content */}
                  <div
                    className={`text-gray-900 space-y-3 md:space-y-6 transition-all duration-500 delay-200 ${
                      index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                  >
                    {banner.badge && (
                      <div className={`inline-flex items-center gap-2 px-2 md:px-4 py-1 md:py-2 rounded-full bg-primary-blue-100 transition-all duration-300 delay-300 ${
                        index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-80'
                      }`}>
                        <Gift className="w-3 h-3 md:w-4 md:h-4 text-primary-blue-600" />
                        <span className="text-[10px] md:text-sm font-semibold text-primary-blue-600">{banner.badge}</span>
                      </div>
                    )}

                    <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold leading-tight">
                      {banner.titulo}
                    </h1>

                    <p className="text-sm md:text-xl lg:text-2xl font-medium text-gray-700">
                      {banner.subtitulo}
                    </p>

                    <p className="text-xs md:text-lg text-gray-600 max-w-xl">
                      {banner.descricao}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-2 md:pt-4">
                      <a
                        href={banner.link_primario}
                        className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-full bg-primary-blue-600 text-white font-semibold text-sm md:text-lg hover:bg-primary-blue-700 transition-colors shadow-lg hover:scale-105"
                      >
                        {banner.botao_primario}
                      </a>
                      <a
                        href={banner.link_secundario}
                        className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-full bg-primary-green-500 text-white font-semibold text-sm md:text-lg hover:bg-primary-green-600 transition-colors hover:scale-105"
                      >
                        {banner.botao_secundario}
                      </a>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div
                    className={`flex items-center justify-center transition-all duration-500 delay-400 ${
                      index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-40 h-40 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
                        <div className="absolute inset-2 md:inset-4 rounded-full bg-white/30 backdrop-blur-sm" />
                      </div>
                      
                      <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                        <img
                          src={banner.imagem}
                          alt="RW Brinquedos"
                          className="w-24 h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 object-contain"
                        />
                      </div>

                      {/* Floating Icons */}
                      <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Star className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 text-primary-yellow-500 fill-current" />
                      </div>

                      <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <Sparkles className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 text-primary-orange-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 0 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 bottom-16 md:bottom-8 md:top-1/2 md:-translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 bottom-16 md:bottom-8 md:top-1/2 md:-translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-white'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
