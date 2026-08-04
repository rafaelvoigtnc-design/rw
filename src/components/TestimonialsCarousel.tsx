'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Avaliacao {
  id: string;
  texto: string;
  nota: number;
  cliente: {
    nome: string;
  };
  criado_em: string;
}

export default function TestimonialsCarousel() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvaliacoes();
  }, []);

  const fetchAvaliacoes = async () => {
    try {
      const response = await fetch('/api/avaliacoes/home');
      const data = await response.json();
      setAvaliacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (avaliacoes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % avaliacoes.length);
    }, 5000); // Rotaciona a cada 5 segundos

    return () => clearInterval(interval);
  }, [avaliacoes.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % avaliacoes.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + avaliacoes.length) % avaliacoes.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (avaliacoes.length === 0) {
    return null;
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">O que nossos clientes dizem</h2>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={avaliacoes.length <= 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={avaliacoes.length <= 1}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {avaliacoes.map((avaliacao) => (
            <div key={avaliacao.id} className="w-full flex-shrink-0 px-4">
              <div className="flex flex-col items-center text-center">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < avaliacao.nota ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-lg text-gray-700 italic mb-6 max-w-2xl mx-auto">
                  &ldquo;{avaliacao.texto}&rdquo;
                </p>
                
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{avaliacao.cliente.nome}</p>
                  <p className="text-sm text-gray-500">{formatarData(avaliacao.criado_em)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores */}
      {avaliacoes.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {avaliacoes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
