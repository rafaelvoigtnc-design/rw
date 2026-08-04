'use client';

import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';

interface Avaliacao {
  id: string;
  texto: string;
  nota: number;
  foto: string | null;
  cliente: {
    nome: string;
  };
}

export default function DepoimentosHome() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/avaliacoes')
      .then(res => res.json())
      .then(data => {
        setAvaliacoes(data.slice(0, 3));
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar avaliações:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-soft h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (avaliacoes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
        <p className="text-secondary-gray-500">Nenhum depoimento disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {avaliacoes.map((avaliacao, index) => (
        <div
          key={avaliacao.id}
          className="bg-white rounded-2xl shadow-soft p-8 relative hover:-translate-y-1 transition-all duration-300"
        >
          <div className="absolute top-4 right-4 text-primary-yellow-500">
            <Quote className="w-8 h-8 opacity-20" />
          </div>
          
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < avaliacao.nota ? 'text-primary-yellow-500 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          
          <p className="text-secondary-gray-700 mb-6 leading-relaxed italic">
            "{avaliacao.texto}"
          </p>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-blue-500 to-primary-green-500 rounded-full flex items-center justify-center text-white font-bold">
              {avaliacao.cliente?.nome?.charAt(0) || 'A'}
            </div>
            <p className="font-semibold text-secondary-gray-900">
              {avaliacao.cliente?.nome}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
