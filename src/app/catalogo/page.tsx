'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Heart, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import Link from 'next/link';

interface Brinquedo {
  id: string;
  nome: string;
  fotos: string[];
  faixa_etaria: string;
  avaliacao_media?: number;
}

export default function Catalogo() {
  const [brinquedos, setBrinquedos] = useState<Brinquedo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroFaixaEtaria, setFiltroFaixaEtaria] = useState('');
  const [busca, setBusca] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [ordenacao, setOrdenacao] = useState('nome');

  const faixasEtarias = ['0-2 anos', '3-5 anos', '6-8 anos', '9-12 anos', 'Todas idades'];

  useEffect(() => {
    fetchBrinquedos();

    const token = document.cookie.match(/client_token=([^;]+)/)?.[1];
    if (token) {
      setIsLoggedIn(true);
      fetchFavoritos();
    }
  }, [filtroFaixaEtaria, busca, ordenacao]);

  const fetchBrinquedos = () => {
    const params = new URLSearchParams();
    if (filtroFaixaEtaria) params.append('faixaEtaria', filtroFaixaEtaria);
    if (busca) params.append('busca', busca);
    params.append('ordenacao', ordenacao);

    fetch(`/api/brinquedos?${params}`)
      .then(res => res.json())
      .then(data => {
        setBrinquedos(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar brinquedos:', error);
        setLoading(false);
      });
  };

  const fetchFavoritos = () => {
    fetch('/api/favoritos')
      .then(res => res.json())
      .then(data => {
        const favIds = new Set<string>(data.map((f: any) => f.brinquedo_id));
        setFavoritos(favIds);
      })
      .catch(error => console.error('Erro ao buscar favoritos:', error));
  };

  const handleFavoritar = async (brinquedoId: string) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/favoritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brinquedoId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.favorito) {
          setFavoritos(prev => new Set(Array.from(prev).concat(brinquedoId)));
        } else {
          setFavoritos(prev => {
            const newSet = new Set(prev);
            newSet.delete(brinquedoId);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    fetchFavoritos();
  };

  const clearFilters = () => {
    setFiltroFaixaEtaria('');
    setBusca('');
  };

  const hasActiveFilters = filtroFaixaEtaria || busca;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-blue-500 via-primary-green-500 to-primary-blue-600 py-16">
        <div className="max-w-[1440px] mx-auto px-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Catálogo de Brinquedos
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Explore nossa coleção completa de brinquedos e itens para festas
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros Laterais */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-secondary-gray-900">Filtros</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Busca */}
                <div>
                  <label className="block text-sm font-medium text-secondary-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-gray-400" />
                    <input
                      type="text"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Nome do brinquedo..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50 text-gray-900"
                    />
                  </div>
                </div>

                {/* Faixa Etária */}
                <div>
                  <label className="block text-sm font-medium text-secondary-gray-700 mb-2">
                    Faixa Etária
                  </label>
                  <select
                    value={filtroFaixaEtaria}
                    onChange={(e) => setFiltroFaixaEtaria(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50 text-gray-900"
                  >
                    <option value="">Todas as faixas etárias</option>
                    {faixasEtarias.map((faixa) => (
                      <option key={faixa} value={faixa}>
                        {faixa}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ordenação */}
                <div>
                  <label className="block text-sm font-medium text-secondary-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={ordenacao}
                    onChange={(e) => setOrdenacao(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50 text-gray-900"
                  >
                    <option value="nome">Nome (A-Z)</option>
                    <option value="nome_desc">Nome (Z-A)</option>
                  </select>
                </div>

                {/* Limpar Filtros */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-secondary-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Grid de Brinquedos */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                    <div className="h-40 md:h-56 bg-gray-200 animate-pulse" />
                    <div className="p-3 md:p-5 space-y-2 md:space-y-3">
                      <div className="h-3 md:h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-2 md:h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                      <div className="h-6 md:h-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : brinquedos.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-soft">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-secondary-gray-900 mb-2">
                  Nenhum brinquedo encontrado
                </h3>
                <p className="text-secondary-gray-600 mb-6">
                  Tente ajustar os filtros para encontrar o que procura
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary-blue-500 text-white rounded-xl hover:bg-primary-blue-600 transition-colors"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-secondary-gray-600">
                    {brinquedos.length} brinquedo{brinquedos.length !== 1 ? 's' : ''} encontrado{brinquedos.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {brinquedos.map((brinquedo, index) => (
                    <div
                      key={brinquedo.id}
                      className="group hover:-translate-y-2 transition-all duration-300"
                    >
                      <Link href={`/brinquedos/${brinquedo.id}`}>
                        <div className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300">
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
                            
                            {brinquedo.avaliacao_media && (
                              <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-white/90 backdrop-blur-sm px-1.5 md:px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 md:w-4 md:h-4 text-primary-yellow-500 fill-current" />
                                <span className="text-xs md:text-sm font-semibold text-secondary-gray-900">
                                  {brinquedo.avaliacao_media.toFixed(1)}
                                </span>
                              </div>
                            )}

                            <button
                              className="absolute top-2 md:top-3 left-2 md:left-3 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 transition-transform"
                              onClick={(e) => {
                                e.preventDefault();
                                handleFavoritar(brinquedo.id);
                              }}
                            >
                              <Heart className={`w-5 h-5 ${favoritos.has(brinquedo.id) ? 'text-red-500 fill-current' : 'text-secondary-gray-600'}`} />
                            </button>
                          </div>

                          <div className="p-3 md:p-5">
                            <h3 className="text-sm md:text-lg font-bold text-secondary-gray-900 mb-1 md:mb-2 line-clamp-2 group-hover:text-primary-blue-600 transition-colors">
                              {brinquedo.nome}
                            </h3>
                            
                            <p className="text-[10px] md:text-sm text-secondary-gray-500 mb-2 md:mb-4">
                              Faixa etária: {brinquedo.faixa_etaria}
                            </p>

                            <button
                              className="w-full bg-primary-blue-500 text-white py-2 md:py-3 rounded-xl text-xs md:text-base font-semibold hover:bg-primary-blue-600 transition-colors flex items-center justify-center gap-1 md:gap-2 hover:scale-102 transition-transform"
                            >
                              <span className="hidden md:inline">Ver Detalhes</span>
                              <span className="md:hidden">Detalhes</span>
                            </button>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
