'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Promocao {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string | null;
  ativa: boolean;
}

export default function AdminPromocoes() {
  const router = useRouter();
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<Promocao | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    ativa: false,
    tempo_indeterminado: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/promocoes');
      const data = await response.json();
      setPromocoes(data);
    } catch (error) {
      console.error('Erro ao buscar promoções:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        data_fim: formData.tempo_indeterminado ? null : formData.data_fim,
      };
      
      const url = editando ? `/api/admin/promocoes/${editando.id}` : '/api/admin/promocoes';
      const method = editando ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setMostrarFormulario(false);
        setEditando(null);
        setFormData({
          titulo: '',
          descricao: '',
          data_inicio: '',
          data_fim: '',
          ativa: false,
          tempo_indeterminado: false,
        });
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao salvar promoção:', error);
    }
  };

  const handleEdit = (promocao: Promocao) => {
    setEditando(promocao);
    setFormData({
      titulo: promocao.titulo,
      descricao: promocao.descricao,
      data_inicio: promocao.data_inicio ? promocao.data_inicio.split('T')[0] : '',
      data_fim: promocao.data_fim ? promocao.data_fim.split('T')[0] : '',
      ativa: promocao.ativa,
      tempo_indeterminado: !promocao.data_fim,
    });
    setMostrarFormulario(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta promoção?')) return;
    
    try {
      const response = await fetch(`/api/admin/promocoes/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao deletar promoção:', error);
    }
  };

  const toggleAtiva = async (promocao: Promocao) => {
    try {
      const response = await fetch(`/api/admin/promocoes/${promocao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...promocao, ativa: !promocao.ativa }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao atualizar promoção:', error);
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
            <h1 className="text-xl font-bold text-gray-900">Gestão de Promoções</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                titulo: '',
                descricao: '',
                data_inicio: '',
                data_fim: '',
                ativa: false,
                tempo_indeterminado: false,
              });
              setMostrarFormulario(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
          >
            + Nova Promoção
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editando ? 'Editar Promoção' : 'Nova Promoção'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  />
                </div>

                {!formData.tempo_indeterminado && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                    <input
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      required={!formData.tempo_indeterminado}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="tempo_indeterminado"
                  checked={formData.tempo_indeterminado}
                  onChange={(e) => setFormData({ ...formData, tempo_indeterminado: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="tempo_indeterminado" className="text-sm font-medium text-gray-700">
                  Tempo indeterminado (promoção ativa até ser desativada)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativa"
                  checked={formData.ativa}
                  onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="ativa" className="text-sm font-medium text-gray-700">
                  Ativa
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                >
                  {editando ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 md:px-6 py-1 md:py-3 text-left text-[8px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-2 md:px-6 py-1 md:py-3 text-left text-[8px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-2 md:px-6 py-1 md:py-3 text-left text-[8px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 md:px-6 py-1 md:py-3 text-left text-[8px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promocoes.map((promocao) => (
                  <tr key={promocao.id}>
                    <td className="px-2 md:px-6 py-1 md:py-4 whitespace-nowrap">
                      <div className="text-[8px] md:text-sm font-medium text-gray-900">{promocao.titulo}</div>
                      <div className="text-[8px] md:text-sm text-gray-500 hidden md:block">{promocao.descricao}</div>
                    </td>
                    <td className="px-2 md:px-6 py-1 md:py-4 whitespace-nowrap">
                      <div className="text-[8px] md:text-sm text-gray-500">
                        {promocao.data_inicio ? new Date(promocao.data_inicio).toLocaleDateString('pt-BR') : 'Não definido'} - {promocao.data_fim ? new Date(promocao.data_fim).toLocaleDateString('pt-BR') : 'Indeterminado'}
                      </div>
                    </td>
                    <td className="px-2 md:px-6 py-1 md:py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAtiva(promocao)}
                        className={`px-1 md:px-2 inline-flex text-[6px] md:text-xs leading-5 font-semibold rounded-full ${
                          promocao.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {promocao.ativa ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>
                    <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-[8px] md:text-sm font-medium">
                      <div className="flex flex-col gap-2 md:flex-row md:gap-4 items-start md:items-center">
                        <button
                          onClick={() => handleEdit(promocao)}
                          className="px-3 py-2 md:px-0 md:py-0 bg-emerald-600 text-white rounded md:bg-transparent md:text-emerald-600 hover:bg-emerald-700 md:hover:text-emerald-900 text-[10px] md:text-xs font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(promocao.id)}
                          className="px-3 py-2 md:px-0 md:py-0 bg-red-600 text-white rounded md:bg-transparent md:text-red-600 hover:bg-red-700 md:hover:text-red-900 text-[10px] md:text-xs font-medium"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
