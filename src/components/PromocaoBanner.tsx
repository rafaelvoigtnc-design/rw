'use client';

import { useEffect, useState } from 'react';
import { Gift, ArrowRight } from 'lucide-react';

interface Promocao {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
}

export default function PromocaoBanner() {
  const [promocao, setPromocao] = useState<Promocao | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/promocoes')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setPromocao(data[0]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar promoções:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="bg-gradient-to-r from-primary-orange-500 to-primary-yellow-500 rounded-2xl h-32 animate-pulse" />
        </div>
      </section>
    );
  }

  if (!promocao) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="bg-gradient-to-r from-primary-orange-500 via-primary-yellow-500 to-primary-orange-500 rounded-xl md:rounded-2xl p-4 md:p-8 text-white relative overflow-hidden hover:scale-101 transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-12 h-12 md:w-24 md:h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center animate-pulse">
                <Gift className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="text-lg md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">{promocao.titulo}</h3>
                <p className="text-white/90 text-sm md:text-lg">{promocao.descricao}</p>
              </div>
            </div>
            
            <a
              href="/promocoes"
              className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white text-primary-orange-600 rounded-lg md:rounded-xl font-semibold text-sm md:text-base hover:bg-gray-100 transition-colors hover:scale-105"
            >
              Ver Promoções
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
