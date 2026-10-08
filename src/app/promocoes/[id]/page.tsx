'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Trophy, CheckCircle, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

interface Promocional {
  id: string;
  titulo: string;
  descricao: string;
  regras: string;
  fotos: string[];
  campos_formulario: Array<{ nome_campo: string; tipo: string; obrigatorio: boolean }>;
  data_inicio: string;
  data_fim: string;
}

export default function DetalhesPromocional() {
  const router = useRouter();
  const params = useParams();
  const { user, userData } = useAuth();
  const [promocional, setPromocional] = useState<Promocional | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [jaParticipou, setJaParticipou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchPromocional();
  }, []);

  const fetchPromocional = async () => {
    try {
      const response = await fetch(`/api/admin/promocionais/${params.id}`);
      const data = await response.json();
      setPromocional(data);

      // Inicializar formData com campos vazios
      const inicial: Record<string, string> = {};
      data.campos_formulario?.forEach((campo: any) => {
        inicial[campo.nome_campo] = '';
      });
      setFormData(inicial);
    } catch (error) {
      console.error('Erro ao buscar promocional:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkParticipacao = async () => {
    if (!userData) return;

    try {
      const response = await fetch(`/api/admin/promocionais/${params.id}/participantes`);
      const participantes = await response.json();
      const participante = participantes.find((p: any) => p.cliente_id === userData.id);
      setJaParticipou(!!participante);
    } catch (error) {
      console.error('Erro ao verificar participação:', error);
    }
  };

  useEffect(() => {
    if (userData) {
      checkParticipacao();
    }
  }, [userData]);

  const proximaImagem = () => {
    if (promocional && promocional.fotos.length > 0) {
      setImagemAtual((imagemAtual + 1) % promocional.fotos.length);
    }
  };

  const imagemAnterior = () => {
    if (promocional && promocional.fotos.length > 0) {
      setImagemAtual((imagemAtual - 1 + promocional.fotos.length) % promocional.fotos.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    if (!userData) {
      setShowLoginModal(true);
      setEnviando(false);
      return;
    }

    try {
      const response = await fetch(`/api/promocionais/${params.id}/participar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: userData.id,
          cliente_nome: userData.nome,
          dados_participacao: formData,
        }),
      });

      if (response.ok) {
        setJaParticipou(true);
        setShowSuccessModal(true);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao participar');
      }
    } catch (error) {
      console.error('Erro ao participar:', error);
      alert('Erro ao participar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <Navbar />
        <div className="p-8">Carregando...</div>
        <Footer />
      </div>
    );
  }

  if (!promocional) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <Navbar />
        <div className="p-8">Promocional não encontrado</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Carrossel de Imagens */}
        {promocional.fotos && promocional.fotos.length > 0 && (
          <div className="mb-8 relative">
            <div className="relative aspect-square bg-gray-200 rounded-2xl overflow-hidden max-w-2xl mx-auto">
              <img
                src={promocional.fotos[imagemAtual]}
                alt={promocional.titulo}
                className="w-full h-full object-cover"
              />

              {promocional.fotos.length > 1 && (
                <>
                  <button
                    onClick={imagemAnterior}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={proximaImagem}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {promocional.fotos.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {promocional.fotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setImagemAtual(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === imagemAtual ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft p-8 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{promocional.titulo}</h1>
              <p className="text-gray-700 mb-6 leading-relaxed">{promocional.descricao}</p>

              <div className="bg-purple-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Regras
                </h2>
                <p className="text-purple-800 whitespace-pre-line">{promocional.regras}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-24">
              {jaParticipou ? (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Você Já Está Participando!</h3>
                  <p className="text-gray-600">Agradecemos por participar deste promocional.</p>
                </div>
              ) : !user ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Faça Login para Participar</h3>
                  <p className="text-gray-600 mb-6">
                    Você precisa estar logado ou criar uma conta para participar deste promocional.
                  </p>
                  <button
                    onClick={() => {
                      const event = new CustomEvent('openAuthModal');
                      window.dispatchEvent(event);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                  >
                    Fazer Login / Criar Conta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Formulário de Participação</h3>

                  {promocional.campos_formulario?.map((campo) => (
                    <div key={campo.nome_campo}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {campo.nome_campo}
                        {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {campo.tipo === 'data' ? (
                        <input
                          type="date"
                          value={formData[campo.nome_campo]}
                          onChange={(e) => setFormData({ ...formData, [campo.nome_campo]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          required={campo.obrigatorio}
                        />
                      ) : campo.tipo === 'numero' ? (
                        <input
                          type="number"
                          value={formData[campo.nome_campo]}
                          onChange={(e) => setFormData({ ...formData, [campo.nome_campo]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          required={campo.obrigatorio}
                        />
                      ) : (
                        <input
                          type="text"
                          value={formData[campo.nome_campo]}
                          onChange={(e) => setFormData({ ...formData, [campo.nome_campo]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          required={campo.obrigatorio}
                        />
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {enviando ? 'Enviando...' : 'Participar'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 text-center">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Participação Registrada!</h3>
            <p className="text-gray-600 mb-6">
              Você está participando deste promocional. Agradecemos por sua participação!
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
