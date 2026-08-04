'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardData {
  entradaLocacao: number;
  injecaoCapital: number;
  gastos: number;
  investimentos: number;
  lucro: number;
  margemLucro: number;
  totalCuidadores: number;
  numeroLocacoes: number;
  ticketMedio: number;
  dadosGrafico: Array<{
    mes: string;
    entradas: number;
    gastos: number;
  }>;
  comparativo: {
    periodoAnterior: number;
    periodoAtual: number;
    variacao: number;
  } | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'mes' | 'trimestre' | 'ano' | 'customizado'>('mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    const hoje = new Date();
    let inicio: Date;
    let fim: Date;

    switch (filtro) {
      case 'mes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case 'trimestre':
        const trimestreAtual = Math.floor(hoje.getMonth() / 3);
        inicio = new Date(hoje.getFullYear(), trimestreAtual * 3, 1);
        fim = new Date(hoje.getFullYear(), (trimestreAtual + 1) * 3, 0);
        break;
      case 'ano':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        fim = new Date(hoje.getFullYear(), 11, 31);
        break;
      case 'customizado':
        inicio = dataInicio ? new Date(dataInicio) : new Date();
        fim = dataFim ? new Date(dataFim) : new Date();
        break;
    }

    setDataInicio(inicio.toISOString().split('T')[0]);
    setDataFim(fim.toISOString().split('T')[0]);
  }, [filtro]);

  useEffect(() => {
    if (dataInicio && dataFim) {
      fetchData();
    }
  }, [dataInicio, dataFim]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/admin/dashboard?dataInicio=${dataInicio}&dataFim=${dataFim}`);
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!data) {
    return <div className="p-8">Erro ao carregar dados.</div>;
  }

  const maxValue = Math.max(
    ...data.dadosGrafico.map(d => Math.max(d.entradas, d.gastos))
  );

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
            <h1 className="text-xl font-bold text-gray-900">Dashboard Financeiro</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="mes">Este Mês</option>
              <option value="trimestre">Este Trimestre</option>
              <option value="ano">Este Ano</option>
              <option value="customizado">Personalizado</option>
            </select>

            {filtro === 'customizado' && (
              <>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </>
            )}
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Entradas de Locação</h3>
            <p className="text-2xl font-bold text-green-600">
              R$ {data.entradaLocacao.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Injeção de Capital</h3>
            <p className="text-2xl font-bold text-blue-600">
              R$ {data.injecaoCapital.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Gastos</h3>
            <p className="text-2xl font-bold text-red-600">
              R$ {data.gastos.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Investimentos</h3>
            <p className="text-2xl font-bold text-purple-600">
              R$ {data.investimentos.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Lucro e Margem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Lucro/Prejuízo</h3>
            <p className={`text-3xl font-bold ${data.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {data.lucro.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Margem de Lucro</h3>
            <p className={`text-3xl font-bold ${data.margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.margemLucro.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Comparativo */}
        {data.comparativo && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Comparativo com Período Anterior</h3>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-500">Período Anterior</p>
                <p className="text-lg font-semibold">R$ {data.comparativo.periodoAnterior.toFixed(2)}</p>
              </div>
              <div className="text-2xl">→</div>
              <div>
                <p className="text-sm text-gray-500">Período Atual</p>
                <p className="text-lg font-semibold">R$ {data.comparativo.periodoAtual.toFixed(2)}</p>
              </div>
              <div className={`px-4 py-2 rounded ${
                data.comparativo.variacao >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <p className="font-semibold">
                  {data.comparativo.variacao >= 0 ? '+' : ''}{data.comparativo.variacao.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Métricas Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Cuidadores</h3>
            <p className="text-2xl font-bold text-gray-800">
              R$ {data.totalCuidadores.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Número de Locações</h3>
            <p className="text-2xl font-bold text-gray-800">
              {data.numeroLocacoes}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Ticket Médio</h3>
            <p className="text-2xl font-bold text-gray-800">
              R$ {data.ticketMedio.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Gráfico de Evolução Mensal */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Evolução Mensal (Últimos 12 meses)</h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-2">
              {data.dadosGrafico.map((d, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex gap-1 items-end h-48">
                    <div
                      className="flex-1 bg-green-500 rounded-t"
                      style={{ height: `${(d.entradas / maxValue) * 100}%` }}
                      title={`Entradas: R$ ${d.entradas.toFixed(2)}`}
                    />
                    <div
                      className="flex-1 bg-red-500 rounded-t"
                      style={{ height: `${(d.gastos / maxValue) * 100}%` }}
                      title={`Gastos: R$ ${d.gastos.toFixed(2)}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center rotate-45 origin-left">
                    {d.mes}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Entradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Gastos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
