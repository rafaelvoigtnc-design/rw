'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Locacao {
  id: string;
  data_evento: string;
  horario_inicio: string;
  horario_fim: string;
  status_locacao: string;
  cliente: {
    nome: string;
  };
  locacao_item: Array<{
    brinquedo: {
      nome: string;
    };
  }>;
}

export default function AdminCalendario() {
  const router = useRouter();
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [view, setView] = useState<'mes' | 'semana'>('mes');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/locacoes');
      const data = await response.json();
      setLocacoes(data);
    } catch (error) {
      console.error('Erro ao buscar locações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDiasDoMes = (data: Date) => {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const dias = [];

    for (let i = 0; i < primeiroDia.getDay(); i++) {
      dias.push(null);
    }

    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(new Date(ano, mes, i));
    }

    return dias;
  };

  const getLocacoesDoDia = (data: Date) => {
    const dataStr = data.toISOString().split('T')[0];
    return locacoes.filter(l => l.data_evento === dataStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'bg-blue-500';
      case 'em_andamento': return 'bg-yellow-500';
      case 'concluida': return 'bg-green-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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
            <h1 className="text-xl font-bold text-gray-900">Calendário de Locações</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Controles do Calendário */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center">
            <button
              onClick={mesAnterior}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-900"
            >
              ← Anterior
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={proximoMes}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-900"
            >
              Próximo →
            </button>
          </div>
        </div>

        {/* Visualização Mensal */}
        {view === 'mes' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                <div key={dia} className="text-center font-semibold text-gray-900">
                  {dia}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {getDiasDoMes(mesAtual).map((dia, index) => {
                if (!dia) {
                  return <div key={index} className="h-24 bg-gray-100 rounded" />;
                }

                const locacoesDoDia = getLocacoesDoDia(dia);
                const hoje = new Date();
                const isHoje = dia.toDateString() === hoje.toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => setDiaSelecionado(dia)}
                    className={`h-24 border rounded p-2 cursor-pointer hover:bg-gray-100 ${
                      isHoje ? 'border-emerald-500 border-2' : 'border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1 text-gray-900">{dia.getDate()}</div>
                    <div className="space-y-1">
                      {locacoesDoDia.slice(0, 3).map((locacao) => (
                        <div
                          key={locacao.id}
                          className={`text-xs px-1 py-0.5 rounded text-white truncate ${getStatusColor(locacao.status_locacao)}`}
                        >
                          {locacao.horario_inicio}
                        </div>
                      ))}
                      {locacoesDoDia.length > 3 && (
                        <div className="text-xs text-gray-900">+{locacoesDoDia.length - 3}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detalhes do Dia Selecionado */}
        {diaSelecionado && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Locações em {formatarData(diaSelecionado)}
            </h3>

            {getLocacoesDoDia(diaSelecionado).length === 0 ? (
              <p className="text-gray-900">Nenhuma locação neste dia.</p>
            ) : (
              <div className="space-y-4">
                {getLocacoesDoDia(diaSelecionado).map((locacao) => (
                  <div key={locacao.id} className="border-l-4 pl-4 py-2" style={{ borderLeftColor: getStatusColor(locacao.status_locacao).replace('bg-', '') }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {locacao.horario_inicio} - {locacao.horario_fim}
                        </p>
                        <p className="text-sm text-gray-900">{locacao.cliente.nome}</p>
                        <p className="text-xs text-gray-900">
                          {locacao.locacao_item.map(item => item.brinquedo.nome).join(', ')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(locacao.status_locacao)}`}>
                        {locacao.status_locacao}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setDiaSelecionado(null)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Legenda */}
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <h4 className="font-semibold mb-2">Legenda de Status</h4>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Em Andamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Concluída</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Cancelada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
