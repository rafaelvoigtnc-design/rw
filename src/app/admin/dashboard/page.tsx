'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TrendingUp, X, Calendar, DollarSign, User, Clock } from 'lucide-react';

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

interface LocacaoFutura {
  id: string;
  cliente_nome?: string;
  data_evento: string;
  horario_inicio: string;
  horario_fim: string;
  valor_total: number;
  sinal_pago: number;
  status_pagamento: string;
  status_locacao: string;
  endereco: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'mes' | 'mes_passado' | 'mes_que_vem' | 'customizado'>('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Estado para gaveta de ganhos futuros
  const [mostrarGanhos, setMostrarGanhos] = useState(false);
  const [filtroGanhos, setFiltroGanhos] = useState<'futuro_geral' | 'mes_passado' | 'este_mes' | 'mes_que_vem' | 'mes_que_vem_mais_1' | 'customizado'>('futuro_geral');
  const [dataInicioGanhos, setDataInicioGanhos] = useState('');
  const [dataFimGanhos, setDataFimGanhos] = useState('');
  const [loadingGanhos, setLoadingGanhos] = useState(false);
  const [ganhosData, setGanhosData] = useState<{
    locacoes: LocacaoFutura[];
    ganhosTotais: number;
    valorBruto: number;
    valorRecebido: number;
    quantidade: number;
  } | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Buscar ganhos quando abrir a gaveta ou mudar filtros
  const fetchGanhos = async () => {
    setLoadingGanhos(true);
    try {
      let url = '/api/admin/ganhos-futuros';
      
      if (filtroGanhos === 'customizado' && dataInicioGanhos && dataFimGanhos) {
        url += `?tipo=customizado&dataInicio=${dataInicioGanhos}&dataFim=${dataFimGanhos}`;
      } else if (filtroGanhos === 'mes_passado') {
        url += `?tipo=passado`;
      } else if (filtroGanhos === 'este_mes') {
        url += `?tipo=este_mes`;
      } else if (filtroGanhos === 'mes_que_vem') {
        url += `?tipo=passado`;
      } else if (filtroGanhos === 'mes_que_vem') {
        url += `?tipo=futuro`;
      } else if (filtroGanhos === 'mes_que_vem_mais_1') {
        url += `?tipo=futuro_mais_1`;
      } else if (filtroGanhos === 'futuro_geral') {
        url += `?tipo=futuro_geral`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setGanhosData(data);
    } catch (error) {
      console.error('Erro ao buscar ganhos futuros:', error);
    } finally {
      setLoadingGanhos(false);
    }
  };

  useEffect(() => {
    if (mostrarGanhos) {
      fetchGanhos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarGanhos, filtroGanhos, dataInicioGanhos, dataFimGanhos]);

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!data) {
    return <div className="p-8">Erro ao carregar dados.</div>;
  }

  const maxValue = data.dadosGrafico && data.dadosGrafico.length > 0
    ? Math.max(...data.dadosGrafico.map(d => Math.max(d.entradas, d.gastos)))
    : 100;

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
          <div className="flex flex-wrap gap-4 items-center justify-between">
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
            <button
              onClick={() => setMostrarGanhos(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Ganhos</span>
            </button>
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

        {/* Gaveta de Ganhos Futuros */}
        {mostrarGanhos && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Visão Futura de Ganhos</h2>
                <button
                  onClick={() => setMostrarGanhos(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {/* Filtros de ganhos */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex flex-wrap gap-4 items-center">
                    <select
                      value={filtroGanhos}
                      onChange={(e) => setFiltroGanhos(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="futuro_geral">Todo Período (Total)</option>
                      <option value="mes_passado">Mês Passado</option>
                      <option value="este_mes">Este Mês</option>
                      <option value="mes_que_vem">Mês que Vem</option>
                      <option value="mes_que_vem_mais_1">Mês que Vem +1</option>
                      <option value="customizado">Personalizado</option>
                    </select>

                    {filtroGanhos === 'customizado' && (
                      <>
                        <DatePicker
                          selected={dataInicioGanhos ? new Date(dataInicioGanhos + 'T00:00:00') : null}
                          onChange={(date: Date | null) => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              setDataInicioGanhos(`${year}-${month}-${day}`);
                            } else {
                              setDataInicioGanhos('');
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
                          selected={dataFimGanhos ? new Date(dataFimGanhos + 'T00:00:00') : null}
                          onChange={(date: Date | null) => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              setDataFimGanhos(`${year}-${month}-${day}`);
                            } else {
                              setDataFimGanhos('');
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

                {loadingGanhos ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Carregando...</p>
                  </div>
                ) : ganhosData ? (
                  <>
                    {/* Cards de Resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          <h3 className="text-sm font-medium text-gray-700">Ganhos Totais</h3>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">
                          R$ {ganhosData.ganhosTotais.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Valor pendente a receber e já recebidos</p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <h3 className="text-sm font-medium text-gray-700">Valor Recebido</h3>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          R$ {ganhosData.valorBruto.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Total já recebido</p>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <h3 className="text-sm font-medium text-gray-700">Locações</h3>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          {ganhosData.quantidade}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Locações pendentes</p>
                      </div>
                    </div>

                    {/* Lista de Locações */}
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="px-6 py-4 border-b bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Locações Pendentes</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horário</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Já Recebido</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">A Receber</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {ganhosData.locacoes.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                  Nenhuma locação pendente encontrada neste período.
                                </td>
                              </tr>
                            ) : (
                              ganhosData.locacoes.map((locacao) => {
                                const aReceber = locacao.valor_total - locacao.sinal_pago;
                                return (
                                  <tr key={locacao.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                      {locacao.cliente_nome || 'Não informado'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                      {new Date(locacao.data_evento).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                      {locacao.horario_inicio} - {locacao.horario_fim}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                      R$ {locacao.valor_total.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-green-600">
                                      R$ {locacao.sinal_pago.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">
                                      R$ {aReceber.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                                        locacao.status_pagamento === 'pago' ? 'bg-green-100 text-green-800' :
                                        locacao.status_pagamento === 'parcial' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {locacao.status_pagamento}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
