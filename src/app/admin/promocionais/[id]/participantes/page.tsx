'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Download, ArrowLeft, Edit, Trash2, X, Save } from 'lucide-react';

interface Participante {
  id: string;
  cliente_nome: string;
  dados_participacao: Record<string, any>;
  data_participacao: string;
}

interface Promocional {
  campos_formulario: Array<{ nome_campo: string }>;
}

export default function ParticipantesPromocional() {
  const router = useRouter();
  const params = useParams();
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [promocional, setPromocional] = useState<Promocional | null>(null);
  const [loading, setLoading] = useState(true);
  const [editandoParticipante, setEditandoParticipante] = useState<Participante | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const id = params.id as string;

      // Buscar promocional para obter campos
      const promResponse = await fetch(`/api/admin/promocionais/${id}`);
      const promData = await promResponse.json();
      setPromocional(promData);

      // Buscar participantes
      const partResponse = await fetch(`/api/admin/promocionais/${id}/participantes`);
      const partData = await partResponse.json();
      setParticipantes(partData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarPlanilha = async () => {
    try {
      const id = params.id as string;
      const response = await fetch(`/api/admin/promocionais/${id}/participantes/export`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `participantes-${id}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  const handleEditar = (participante: Participante) => {
    setEditandoParticipante(participante);
    setEditFormData(participante.dados_participacao || {});
  };

  const handleSalvarEdicao = async () => {
    if (!editandoParticipante) return;

    try {
      const id = params.id as string;
      const response = await fetch(`/api/admin/promocionais/${id}/participantes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participanteId: editandoParticipante.id,
          dados_participacao: editFormData,
        }),
      });

      if (response.ok) {
        alert('Participante atualizado com sucesso!');
        setEditandoParticipante(null);
        setEditFormData({});
        fetchData();
      } else {
        alert('Erro ao atualizar participante');
      }
    } catch (error) {
      console.error('Erro ao atualizar participante:', error);
      alert('Erro ao atualizar participante');
    }
  };

  const handleExcluir = async (participanteId: string) => {
    if (!confirm('Tem certeza que deseja excluir este participante?')) return;

    try {
      const id = params.id as string;
      const response = await fetch(`/api/admin/promocionais/${id}/participantes?participanteId=${participanteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Participante excluído com sucesso!');
        fetchData();
      } else {
        alert('Erro ao excluir participante');
      }
    } catch (error) {
      console.error('Erro ao excluir participante:', error);
      alert('Erro ao excluir participante');
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
              onClick={() => router.push('/admin/promocoes')}
              className="flex items-center gap-2 text-gray-800 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1 className="text-xl font-bold text-gray-900">Participantes</h1>
            <button
              onClick={exportarPlanilha}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
            >
              <Download className="w-4 h-4" />
              Baixar Planilha
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Participação
                  </th>
                  {promocional?.campos_formulario?.map((campo) => (
                    <th
                      key={campo.nome_campo}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {campo.nome_campo}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participantes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3 + (promocional?.campos_formulario?.length || 0)}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Nenhum participante ainda
                    </td>
                  </tr>
                ) : (
                  participantes.map((participante) => (
                    <tr key={participante.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participante.cliente_nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(participante.data_participacao).toLocaleString('pt-BR')}
                      </td>
                      {promocional?.campos_formulario?.map((campo) => (
                        <td
                          key={campo.nome_campo}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {participante.dados_participacao?.[campo.nome_campo] || '-'}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditar(participante)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExcluir(participante.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {editandoParticipante && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Editar Participante</h2>
              <button
                onClick={() => {
                  setEditandoParticipante(null);
                  setEditFormData({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Cliente:</strong> {editandoParticipante.cliente_nome}
                </p>
              </div>

              {promocional?.campos_formulario?.map((campo) => (
                <div key={campo.nome_campo}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {campo.nome_campo}
                  </label>
                  <input
                    type="text"
                    value={editFormData[campo.nome_campo] || ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        [campo.nome_campo]: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSalvarEdicao}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setEditandoParticipante(null);
                    setEditFormData({});
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
