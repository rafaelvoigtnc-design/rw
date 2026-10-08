'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';

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
  const { user, getToken } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    texto: '',
    nota: 5,
    foto: null as string | null,
  });

  useEffect(() => {
    fetch('/api/avaliacoes?tipo=depoimentos')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const token = await getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          texto: formData.texto,
          nota: formData.nota,
          foto: formData.foto,
        }),
      });

      if (response.ok) {
        alert('Depoimento enviado com sucesso! Aguarde aprovação.');
        setMostrarFormulario(false);
        setFormData({ texto: '', nota: 5, foto: null });
        // Recarregar avaliações
        const data = await response.json();
        setAvaliacoes([...avaliacoes, data]);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao enviar depoimento');
      }
    } catch (error) {
      console.error('Erro ao enviar depoimento:', error);
      alert('Erro ao enviar depoimento');
    }
  };

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
          <p className="text-xl text-white/90 max-w-2xl mb-6">
            O que nossos clientes dizem sobre nossos serviços
          </p>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-white text-primary-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            + Deixar meu Depoimento
          </button>
        </div>
      </section>

      {/* Formulário de Depoimento */}
      {mostrarFormulario && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Deixe seu Depoimento</h2>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  setFormData({ texto: '', nota: 5, foto: null });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Depoimento</label>
                <textarea
                  value={formData.texto}
                  onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  rows={4}
                  required
                  placeholder="Conte sua experiência com nossos serviços..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((nota) => (
                    <button
                      key={nota}
                      type="button"
                      onClick={() => setFormData({ ...formData, nota })}
                      className={`text-2xl ${nota <= formData.nota ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, foto: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
                {formData.foto && (
                  <div className="mt-2">
                    <img
                      src={formData.foto}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, foto: null })}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remover foto
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary-orange-500 text-white px-4 py-2 rounded-md hover:bg-primary-orange-600"
                >
                  Enviar Depoimento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setFormData({ texto: '', nota: 5, foto: null });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                
                {avaliacao.foto && (
                  <div className="mb-4">
                    <img
                      src={avaliacao.foto}
                      alt="Foto do depoimento"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {avaliacao.cliente?.nome}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatarData(avaliacao.criado_em)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
