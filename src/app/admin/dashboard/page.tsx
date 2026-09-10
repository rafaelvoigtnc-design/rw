'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DashboardData {
  entradaLocacao: number;
  injecaoCapital: number;
  gastos: number;
  investimentos: number;
  perdas: number;
  lucro: number;
  margemLucro: number;
  totalCuidadores: number;
  numeroLocacoes: number;
  numeroBrinquedos: number;
  brinquedosAtivos: number;
  brinquedosIndisponiveis: number;
  brinquedosManutencao: number;
  brinquedosAposentados: number;
  ticketMedio: number;
  saldoEmCaixa: number;
  dadosGrafico: Array<{
    mes: string;
    entradas: number;
    gastos: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'mes' | 'mes_passado' | 'mes_que_vem' | 'customizado'>('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    const hoje = new Date();
    let inicio: Date;
    let fim: Date;

    switch (filtro) {
      case 'todos':
        // Período indefinido (não filtra por data) - usa ano atual
        inicio = new Date(hoje.getFullYear(), 0, 1);
        fim = new Date(hoje.getFullYear(), 11, 31);
        break;
      case 'mes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case 'mes_passado':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        break;
      case 'mes_que_vem':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
        fim = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0);
        break;
      case 'customizado':
        // Não muda datas no customizado, usa as que o usuário selecionou
        return;
    }

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setDataInicio(formatDate(inicio));
    setDataFim(formatDate(fim));
  }, [filtro]);

  useEffect(() => {
    fetchData();
  }, [dataInicio, dataFim]);

  const fetchData = async () => {
    setLoading(true);
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
              <option value="todos">Todo o Período</option>
              <option value="mes">Este Mês</option>
              <option value="mes_passado">Mês Passado</option>
              <option value="mes_que_vem">Mês que Vem</option>
              <option value="customizado">Personalizado</option>
            </select>

            {filtro === 'customizado' && (
              <>
                <DatePicker
                  selected={dataInicio ? new Date(dataInicio + 'T00:00:00') : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setDataInicio(`${year}-${month}-${day}`);
                    } else {
                      setDataInicio('');
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  placeholderText="Data início"
                />
                <DatePicker
                  selected={dataFim ? new Date(dataFim + 'T00:00:00') : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setDataFim(`${year}-${month}-${day}`);
                    } else {
                      setDataFim('');
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  placeholderText="Data fim"
                />
              </>
            )}
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
          <div className="bg-white rounded-xl md:rounded-lg shadow-soft p-3 md:p-6">
            <h3 className="text-[10px] md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Entradas de Locação</h3>
            <p className="text-lg md:text-2xl font-bold text-green-600">
              R$ {data.entradaLocacao.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl md:rounded-lg shadow-soft p-3 md:p-6">
            <h3 className="text-[10px] md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Injeção de Capital</h3>
            <p className="text-lg md:text-2xl font-bold text-blue-600">
              R$ {data.injecaoCapital.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl md:rounded-lg shadow-soft p-3 md:p-6">
            <h3 className="text-[10px] md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Gastos</h3>
            <p className="text-lg md:text-2xl font-bold text-red-600">
              R$ {data.gastos.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl md:rounded-lg shadow-soft p-3 md:p-6">
            <h3 className="text-[10px] md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Investimentos</h3>
            <p className="text-lg md:text-2xl font-bold text-purple-600">
              R$ {data.investimentos.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Lucro, Margem e Caixa */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
          <div className="bg-white rounded-xl md:rounded-lg shadow-soft p-3 md:p-6">
            <h3 className="text-[10px] md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Lucro/Prejuízo</h3>
            <p className={`text-xl md:text-3xl font-bold ${data.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {data.lucro.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl md:rounded-lg shadow-soft p-3 md:p-6">
            <h3 className="text-[10px] md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Margem de Lucro</h3>
            <p className={`text-xl md:text-3xl font-bold ${data.margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.margemLucro.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-xl md:rounded-lg shadow-soft p-3 md:p-6">
            <h3 className="text-[10px] md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Em Caixa</h3>
            <p className={`text-xl md:text-3xl font-bold ${data.saldoEmCaixa >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              R$ {data.saldoEmCaixa.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Métricas Adicionais */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Cuidadores</h3>
              <p className="text-2xl font-bold text-gray-800">
                R$ {data.totalCuidadores.toFixed(2)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Nº de Locações</h3>
              <p className="text-2xl font-bold text-gray-800">
                {data.numeroLocacoes}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Nº de Brinquedos</h3>
              <p className="text-2xl font-bold text-gray-800">
                {data.numeroBrinquedos}
              </p>
              <div className="text-xs text-gray-500 mt-1 space-y-1">
                <p>{data.brinquedosAtivos} disponíveis</p>
                <p>{data.brinquedosIndisponiveis} indisponíveis</p>
                <p>{data.brinquedosManutencao} em manutenção</p>
                <p>{data.brinquedosAposentados} aposentados</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ticket Médio</h3>
          <p className="text-2xl font-bold text-gray-800">
            R$ {data.ticketMedio.toFixed(2)}
          </p>
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
