'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Share2, Star, ChevronLeft, ChevronRight, Phone, ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

interface Brinquedo {
  id: string;
  nome: string;
  descricao: string;
  fotos: string[];
  tema_layout: string;
  dimensoes: string;
  faixa_etaria: string;
  categoria: {
    nome: string;
  };
  avaliacao_media?: number;
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
  const [mostrarVerificacao, setMostrarVerificacao] = useState(false);
  const [verificacaoForm, setVerificacaoForm] = useState({ data: '', horario_inicio: '', horario_fim: '' });
  const [resultadoVerificacao, setResultadoVerificacao] = useState<{ disponivel: boolean; conflitos: string[] } | null>(null);
  const [verificando, setVerificando] = useState(false);

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

    const token = document.cookie.match(/client_token=([^;]+)/)?.[1];
    if (token) {
      setIsLoggedIn(true);
      checkFavorito();
    }
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

  const handleVerificarDisponibilidade = async () => {
    if (!verificacaoForm.data || !verificacaoForm.horario_inicio || !verificacaoForm.horario_fim) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setVerificando(true);
    setResultadoVerificacao(null);

    try {
      const response = await fetch(`/api/brinquedos/${id}/verificar-disponibilidade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificacaoForm),
      });

      const data = await response.json();
      setResultadoVerificacao(data);
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      alert('Erro ao verificar disponibilidade');
    } finally {
      setVerificando(false);
    }
  };

  const handleAdicionarAoCarrinho = async () => {
    if (!resultadoVerificacao || !resultadoVerificacao.disponivel) return;

    try {
      const response = await fetch('/api/carrinho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brinquedoId: id,
          dataInteresse: verificacaoForm.data,
          horarioInicio: verificacaoForm.horario_inicio,
          horarioFim: verificacaoForm.horario_fim,
        }),
      });

      if (response.ok) {
        alert('Brinquedo adicionado ao carrinho com sucesso!');
        setMostrarVerificacao(false);
        setResultadoVerificacao(null);
      } else {
        alert('Erro ao adicionar ao carrinho');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      alert('Erro ao adicionar ao carrinho');
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
    <div className="min-h-screen bg-gray-50 pt-16">
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
            <div>
              <span className="text-sm font-medium text-primary-blue-600 bg-primary-blue-50 px-3 py-1 rounded-full">
                {brinquedo.categoria?.nome}
              </span>
            </div>

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

            {/* Verificar Disponibilidade */}
            <button
              onClick={() => setMostrarVerificacao(!mostrarVerificacao)}
              className="w-full py-4 border-2 border-primary-blue-500 text-primary-blue-600 rounded-2xl font-semibold hover:bg-primary-blue-50 transition-colors"
            >
              {mostrarVerificacao ? 'Ocultar Verificação de Disponibilidade' : 'Verificar Disponibilidade'}
            </button>

            {mostrarVerificacao && (
              <div className="bg-white rounded-2xl shadow-soft p-6 border-2 border-gray-200 animate-in slide-in-from-top duration-300"
              >
                <h3 className="text-xl font-bold text-secondary-gray-900 mb-6">Verificar Disponibilidade</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-gray-700 mb-2">
                      Data do Evento
                    </label>
                    <input
                      type="date"
                      value={verificacaoForm.data}
                      onChange={(e) => setVerificacaoForm({ ...verificacaoForm, data: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-gray-700 mb-2">
                        Horário Início
                      </label>
                      <input
                        type="time"
                        step="3600"
                        value={verificacaoForm.horario_inicio}
                        onChange={(e) => setVerificacaoForm({ ...verificacaoForm, horario_inicio: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-gray-700 mb-2">
                        Horário Fim
                      </label>
                      <input
                        type="time"
                        step="3600"
                        value={verificacaoForm.horario_fim}
                        onChange={(e) => setVerificacaoForm({ ...verificacaoForm, horario_fim: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleVerificarDisponibilidade}
                    disabled={verificando}
                    className="w-full bg-primary-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-primary-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verificando ? 'Verificando...' : 'Verificar Disponibilidade'}
                  </button>

                  {resultadoVerificacao && (
                    <div className={`mt-4 p-4 rounded-xl ${
                      resultadoVerificacao.disponivel 
                        ? 'bg-green-50 border-2 border-green-200' 
                        : 'bg-red-50 border-2 border-red-200'
                    }`}>
                      {resultadoVerificacao.disponivel ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <p className="text-green-800 font-semibold">Brinquedo disponível para este horário!</p>
                          </div>
                          <button
                            onClick={handleAdicionarAoCarrinho}
                            className="w-full bg-primary-green-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            Adicionar ao Carrinho
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <XCircle className="w-6 h-6 text-red-600" />
                            <p className="text-red-800 font-semibold">Brinquedo não disponível</p>
                          </div>
                          <ul className="text-red-700 text-sm space-y-2">
                            {resultadoVerificacao.conflitos && resultadoVerificacao.conflitos.map((conflito, index) => (
                              <li key={index}>• {conflito}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
