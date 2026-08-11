'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Share2, Star, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

interface Brinquedo {
  id: string;
  nome: string;
  descricao: string;
  fotos: string[];
  dimensoes: string;
  faixa_etaria: string;
  categoria: {
    nome: string;
  };
  avaliacao_media?: number;
}

interface Avaliacao {
  id: string;
  cliente_id: string;
  texto: string;
  nota: number;
  criado_em: string;
  cliente?: {
    nome: string;
  };
}

export default function BrinquedoPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [brinquedo, setBrinquedo] = useState<Brinquedo | null>(null);
  const [loading, setLoading] = useState(true);
  const [fotoAtual, setFotoAtual] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFavorito, setIsFavorito] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [novaAvaliacao, setNovaAvaliacao] = useState({ nota: 0, texto: '' });
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);


  useEffect(() => {
    fetch(`/api/brinquedos/${id}`)
      .then(res => res.json())
      .then(data => {
        setBrinquedo(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao buscar brinquedo:', error);
        setLoading(false);
      });

    // Verificar login via API
    fetch('/api/cliente/perfil')
      .then(res => {
        if (res.ok) {
          setIsLoggedIn(true);
          checkFavorito();
        }
      })
      .catch(error => {
        console.error('Erro ao verificar login:', error);
      });

    // Buscar avaliações
    fetch(`/api/avaliacoes?brinquedo_id=${id}`)
      .then(res => res.json())
      .then(data => {
        setAvaliacoes(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error('Erro ao buscar avaliações:', error);
        setAvaliacoes([]); // Garantir que seja array mesmo em caso de erro
      });
  }, [id]);

  const checkFavorito = async () => {
    try {
      const response = await fetch('/api/favoritos');
      if (response.ok) {
        const data = await response.json();
        const favorito = data.find((f: any) => f.brinquedo_id === id);
        setIsFavorito(!!favorito);
      }
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
    }
  };

  const handleFavoritar = async () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/favoritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brinquedoId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorito(data.favorito);
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    checkFavorito();
  };

  const handleEnviarAvaliacao = async () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    if (novaAvaliacao.nota === 0 || !novaAvaliacao.texto.trim()) {
      alert('Por favor, selecione uma nota e escreva um comentário');
      return;
    }

    setEnviandoAvaliacao(true);

    try {
      const response = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nota: novaAvaliacao.nota,
          texto: novaAvaliacao.texto,
        }),
      });

      if (response.ok) {
        alert('Avaliação enviada com sucesso!');
        setNovaAvaliacao({ nota: 0, texto: '' });
        // Recarregar avaliações
        try {
          const avaliacoesData = await fetch(`/api/avaliacoes?brinquedo_id=${id}`);
          const avaliacoesAtualizadas = await avaliacoesData.json();
          setAvaliacoes(Array.isArray(avaliacoesAtualizadas) ? avaliacoesAtualizadas : []);
        } catch (error) {
          console.error('Erro ao recarregar avaliações:', error);
        }
      } else {
        alert('Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação');
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <Navbar />
        <div className="max-w-[1440px] mx-auto px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-96 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!brinquedo) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <Navbar />
        <div className="max-w-[1440px] mx-auto px-6 py-12">
          <p className="text-secondary-gray-500">Brinquedo não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <Navbar />
      
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-secondary-gray-600 mb-8">
          <a href="/" className="hover:text-primary-blue-600 transition-colors">Home</a>
          <span>/</span>
          <a href="/catalogo" className="hover:text-primary-blue-600 transition-colors">Catálogo</a>
          <span>/</span>
          <span className="text-secondary-gray-900 font-medium">{brinquedo.nome}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Galeria de Fotos */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl shadow-soft overflow-hidden">
              {brinquedo.fotos && brinquedo.fotos.length > 0 ? (
                <img
                  key={fotoAtual}
                  src={brinquedo.fotos[fotoAtual]}
                  alt={brinquedo.nome}
                  className="w-full h-full object-cover animate-in fade-in duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-secondary-gray-400">Sem foto</span>
                </div>
              )}

              {/* Navegação */}
              {brinquedo.fotos && brinquedo.fotos.length > 1 && (
                <>
                  <button
                    onClick={() => setFotoAtual((prev) => (prev - 1 + brinquedo.fotos.length) % brinquedo.fotos.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setFotoAtual((prev) => (prev + 1) % brinquedo.fotos.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Badge de avaliação */}
              {brinquedo.avaliacao_media && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2 shadow-lg">
                  <Star className="w-5 h-5 text-primary-yellow-500 fill-current" />
                  <span className="text-lg font-bold text-secondary-gray-900">
                    {brinquedo.avaliacao_media.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Botão de favorito */}
              <button
                onClick={handleFavoritar}
                className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors hover:scale-110 transition-transform"
              >
                <Heart className={`w-6 h-6 ${isFavorito ? 'text-red-500 fill-current' : 'text-secondary-gray-600'}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {brinquedo.fotos && brinquedo.fotos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {brinquedo.fotos.map((foto, index) => (
                  <button
                    key={index}
                    onClick={() => setFotoAtual(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all ${
                      index === fotoAtual ? 'ring-2 ring-primary-blue-500 ring-offset-2' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={foto} alt={`${brinquedo.nome} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-secondary-gray-900 leading-tight">
              {brinquedo.nome}
            </h1>

            <div className="flex flex-wrap gap-4 text-secondary-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">Faixa Etária:</span>
                <span>{brinquedo.faixa_etaria}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Dimensões:</span>
                <span>{brinquedo.dimensoes}</span>
              </div>
            </div>

            <p className="text-lg text-secondary-gray-700 leading-relaxed">
              {brinquedo.descricao}
            </p>

            {/* Botão Gigante WhatsApp */}
            <a
              href={`https://wa.me/5555997302463?text=${encodeURIComponent(`Olá! Gostaria de solicitar um orçamento para o brinquedo: ${brinquedo.nome}. Poderia me passar mais informações?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full bg-primary-green-500 text-white py-5 rounded-2xl font-bold text-xl hover:bg-primary-green-600 transition-colors shadow-soft hover:scale-102 transition-transform"
            >
              <Phone className="w-8 h-8" />
              Solicitar Orçamento pelo WhatsApp
            </a>

            {/* Formulário de Avaliação */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-secondary-gray-900 mb-4">Avaliar este brinquedo</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-gray-700 mb-2">Sua nota (1-5 estrelas)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((estrela) => (
                      <button
                        key={estrela}
                        type="button"
                        onClick={() => setNovaAvaliacao({ ...novaAvaliacao, nota: estrela })}
                        className={`text-3xl transition-all ${
                          novaAvaliacao.nota >= estrela ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-gray-700 mb-2">Seu comentário</label>
                  <textarea
                    value={novaAvaliacao.texto}
                    onChange={(e) => setNovaAvaliacao({ ...novaAvaliacao, texto: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-white text-gray-900"
                    rows={3}
                    placeholder="Conte sua experiência com este brinquedo..."
                  />
                </div>
                <button
                  onClick={handleEnviarAvaliacao}
                  disabled={enviandoAvaliacao}
                  className="w-full bg-primary-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviandoAvaliacao ? 'Enviando...' : 'Enviar Avaliação'}
                </button>
              </div>
            </div>

            {/* Lista de Avaliações */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-secondary-gray-900">Avaliações ({avaliacoes.length})</h3>
              {avaliacoes.length === 0 ? (
                <p className="text-secondary-gray-500 text-center py-8">Seja o primeiro a avaliar este brinquedo!</p>
              ) : (
                <div className="space-y-4">
                  {avaliacoes.map((avaliacao) => (
                    <div key={avaliacao.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-primary-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-blue-600 font-semibold">
                              {avaliacao.cliente?.nome?.charAt(0) || 'C'}
                            </span>
                          </div>
                          <span className="font-medium text-secondary-gray-900">
                            {avaliacao.cliente?.nome || 'Cliente'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((estrela) => (
                            <span
                              key={estrela}
                              className={`text-sm ${
                                avaliacao.nota >= estrela ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-secondary-gray-700">{avaliacao.texto}</p>
                      <p className="text-xs text-secondary-gray-400 mt-2">
                        {new Date(avaliacao.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
