'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Avaliacao {
  id: string;
  texto: string;
  nota: number;
  foto: string | null;
  aprovado_para_exibir: boolean;
  exibir_no_home: boolean;
  criado_em: string;
  cliente: {
    nome: string;
    email: string;
  };
  brinquedo: {
    nome: string;
  };
}

export default function AdminAvaliacoes() {
  const router = useRouter();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'pendentes' | 'aprovadas' | 'home'>('todas');

  useEffect(() => {
    fetchData();
  }, [filtro]);

  const fetchData = async () => {
    try {
      const url = filtro === 'todas' 
        ? '/api/admin/avaliacoes'
        : `/api/admin/avaliacoes?filtro=${filtro}`;
      const response = await fetch(url);
      const data = await response.json();
      setAvaliacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      setAvaliacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (id: string, aprovado: boolean) => {
    try {
      const response = await fetch(`/api/admin/avaliacoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprovado }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao aprovar/recusar avaliação:', error);
    }
  };

  const handleToggleHome = async (id: string, exibirNoHome: boolean) => {
    try {
      const response = await fetch(`/api/admin/avaliacoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exibir_no_home: exibirNoHome }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao alterar exibição no home:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              onClick={() => router.push('/admin')}
              className="text-gray-800 hover:text-gray-900"
            >
              ← Voltar
            </button>
            <h1 className="text-xl font-bold text-gray-900">Aprovação de Avaliações</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filtro === 'todas' ? 'bg-primary-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltro('pendentes')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filtro === 'pendentes' ? 'bg-primary-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFiltro('aprovadas')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filtro === 'aprovadas' ? 'bg-primary-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Aprovadas
            </button>
            <button
              onClick={() => setFiltro('home')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filtro === 'home' ? 'bg-primary-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏠 Exibir no Home
            </button>
          </div>
        </div>

        {avaliacoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-700">Nenhuma avaliação encontrada.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {avaliacoes.map((avaliacao) => (
              <div key={avaliacao.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {avaliacao.cliente.nome}
                    </h3>
                    <p className="text-sm text-gray-600">{avaliacao.cliente.email}</p>
                    <p className="text-sm text-gray-600">
                      Brinquedo: {avaliacao.brinquedo.nome}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(avaliacao.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {avaliacao.aprovado_para_exibir && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Aprovada
                        </span>
                      )}
                      {avaliacao.exibir_no_home && (
                        <span className="px-2 py-1 bg-primary-green-100 text-primary-green-700 text-xs rounded-full">
                          🏠 No Home
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < avaliacao.nota ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">({avaliacao.nota}/5)</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 italic">&ldquo;{avaliacao.texto}&rdquo;</p>

                {avaliacao.foto && (
                  <div className="mb-4">
                    <img
                      src={avaliacao.foto}
                      alt="Foto da avaliação"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {!avaliacao.aprovado_para_exibir ? (
                    <>
                      <button
                        onClick={() => handleAprovar(avaliacao.id, true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleAprovar(avaliacao.id, false)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        Recusar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAprovar(avaliacao.id, false)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                    >
                      Desaprovar
                    </button>
                  )}
                  
                  {avaliacao.aprovado_para_exibir && (
                    <button
                      onClick={() => handleToggleHome(avaliacao.id, !avaliacao.exibir_no_home)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        avaliacao.exibir_no_home 
                          ? 'bg-primary-green-600 text-white hover:bg-primary-green-700' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {avaliacao.exibir_no_home ? '🏠 Remover do Home' : '🏠 Exibir no Home'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
