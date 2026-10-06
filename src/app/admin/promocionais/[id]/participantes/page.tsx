'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, ArrowLeft } from 'lucide-react';

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
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [promocional, setPromocional] = useState<Promocional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const id = router.query.id as string;

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
      const id = router.query.id as string;
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participantes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + (promocional?.campos_formulario?.length || 0)}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
