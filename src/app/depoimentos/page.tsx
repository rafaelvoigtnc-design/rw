'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Avaliacao {
  id: string;
  texto: string;
  nota: number;
  foto: string | null;
  cliente: {
    nome: string;
  };
  criado_em: string;
}

export default function Depoimentos() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/avaliacoes')
      .then(res => res.json())
      .then(data => {
        setAvaliacoes(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar avaliações:', error);
        setLoading(false);
      });
  }, []);

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
      <section className="bg-gradient-to-br from-primary-yellow-400 via-primary-orange-400 to-primary-pink-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Depoimentos
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            O que nossos clientes dizem sobre nossos serviços
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg p-6 h-48 animate-pulse" />
            ))}
          </div>
        ) : avaliacoes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum depoimento disponível no momento.</p>
            <p className="text-gray-400 mt-2">Seja o primeiro a compartilhar sua experiência!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avaliacoes.map((avaliacao) => (
              <div key={avaliacao.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < avaliacao.nota ? 'fill-current' : 'fill-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">{avaliacao.nota}/5</span>
                </div>
                
                <p className="text-gray-700 mb-4 italic">&ldquo;{avaliacao.texto}&rdquo;</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {avaliacao.cliente?.nome}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatarData(avaliacao.criado_em)}
                    </p>
                  </div>
                  
                  {avaliacao.foto && (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Foto</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
