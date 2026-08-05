'use client';

import { useEffect, useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';

interface Brinquedo {
  id: string;
  nome: string;
  fotos: string[];
  faixa_etaria: string;
  categoria: {
    nome: string;
  };
  avaliacao_media?: number;
}

export default function BrinquedosDestaque() {
  const [brinquedos, setBrinquedos] = useState<Brinquedo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/brinquedos?home=true')
      .then(res => res.json())
      .then(data => {
        setBrinquedos(data.slice(0, 8)); // Mostrar 8 brinquedos
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar brinquedos:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="h-40 md:h-56 bg-gray-200 animate-pulse" />
            <div className="p-3 md:p-4 space-y-2 md:space-y-3">
              <div className="h-3 md:h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 md:h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-6 md:h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (brinquedos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-gray-500">Nenhum brinquedo disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {brinquedos.map((brinquedo, index) => (
        <div
          key={brinquedo.id}
          className="group hover:-translate-y-2 transition-all duration-300"
        >
          <Link href={`/brinquedos/${brinquedo.id}`}>
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300">
              {/* Imagem */}
              <div className="relative h-40 md:h-56 overflow-hidden bg-gray-100">
                {brinquedo.fotos && brinquedo.fotos.length > 0 ? (
                  <img
                    src={brinquedo.fotos[0]}
                    alt={brinquedo.nome}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-secondary-gray-400 text-xs md:text-sm">Sem foto</span>
                  </div>
                )}
                
                {/* Badge de avaliação */}
                {brinquedo.avaliacao_media && (
                  <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-white/90 backdrop-blur-sm px-1.5 md:px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 md:w-4 md:h-4 text-primary-yellow-500 fill-current" />
                    <span className="text-xs md:text-sm font-semibold text-secondary-gray-900">
                      {brinquedo.avaliacao_media.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Botão de favorito */}
                <button
                  className="absolute top-2 md:top-3 left-2 md:left-3 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 transition-transform"
                  onClick={(e) => {
                    e.preventDefault();
                    // Implementar favorito
                  }}
                >
                  <Heart className="w-4 h-4 md:w-5 md:h-5 text-secondary-gray-600 hover:text-red-500 transition-colors" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="p-3 md:p-5">
                <div className="mb-1.5 md:mb-2">
                  <span className="text-[10px] md:text-xs font-medium text-primary-blue-600 bg-primary-blue-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                    {brinquedo.categoria?.nome}
                  </span>
                </div>
                
                <h3 className="text-sm md:text-lg font-bold text-secondary-gray-900 mb-1 md:mb-2 line-clamp-2 group-hover:text-primary-blue-600 transition-colors">
                  {brinquedo.nome}
                </h3>
                
                <p className="text-[10px] md:text-sm text-secondary-gray-500 mb-2 md:mb-4">
                  Faixa etária: {brinquedo.faixa_etaria}
                </p>

                <button
                  className="w-full bg-primary-green-500 text-white py-2 md:py-3 rounded-xl text-xs md:text-base font-semibold hover:bg-primary-green-600 transition-colors flex items-center justify-center gap-1 md:gap-2 hover:scale-102 transition-transform"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(`https://wa.me/5555997302463?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre o brinquedo: ${brinquedo.nome}`)}`, '_blank');
                  }}
                >
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:inline">Solicitar Orçamento</span>
                  <span className="md:hidden">Orçamento</span>
                </button>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
