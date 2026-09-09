'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Transacao {
  id: string;
  tipo: string;
  valor: number;
  data: string;
  descricao: string;
  categoria: string | null;
  locacao_id: string | null;
  origem: string | null;
}

export default function AdminFinanceiro() {
  const router = useRouter();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoTransacao, setEditandoTransacao] = useState<Transacao | null>(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<'todos' | 'mes' | 'mes_passado' | 'mes_que_vem' | 'customizado'>('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [formData, setFormData] = useState({
    tipo: 'injecao_capital',
    valor: 0,
    data: (() => {
      const hoje = new Date();
      const year = hoje.getFullYear();
      const month = String(hoje.getMonth() + 1).padStart(2, '0');
      const day = String(hoje.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    descricao: '',
    categoria: '',
    origem: 'caixa_empresa', // Apenas para investimentos/perdas
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const hoje = new Date();
    let inicio: Date;
    let fim: Date;

    switch (filtroPeriodo) {
      case 'todos':
        inicio = new Date(hoje.getFullYear(), 0, 1); // 1º de janeiro do ano atual
        fim = new Date(hoje.getFullYear(), 11, 31); // 31 de dezembro do ano atual
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
  }, [filtroPeriodo]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/financeiro');
      const data = await response.json();
      setTransacoes(data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editandoTransacao
        ? `/api/admin/financeiro/${editandoTransacao.id}`
        : '/api/admin/financeiro';
      const method = editandoTransacao ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMostrarFormulario(false);
        setEditandoTransacao(null);
        setFormData({
          tipo: 'injecao_capital',
          valor: 0,
          data: new Date().toISOString().split('T')[0],
          descricao: '',
          categoria: '',
          origem: 'caixa_empresa', // Apenas para investimentos/perdas
        });
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleEdit = (transacao: Transacao) => {
    setEditandoTransacao(transacao);
    setFormData({
      tipo: transacao.tipo,
      valor: transacao.valor,
      data: transacao.data,
      descricao: transacao.descricao,
      categoria: transacao.categoria || '',
      origem: transacao.origem || 'caixa_empresa',
    });
    setMostrarFormulario(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      const response = await fetch(`/api/admin/financeiro/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'injecao_capital': return 'Injeção de Capital';
      case 'devolucao_capital': return 'Devolução de Capital';
      case 'gasto': return 'Gasto';
      case 'investimento': return 'Investimento';
      case 'ENTRADA_LOCACAO': return 'Entrada de Locação';
      case 'entrada_locacao': return 'Entrada de Locação';
      case 'perda': return 'Perda/Roubo';
      default: return tipo;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'injecao_capital': return 'bg-blue-100 text-blue-800';
      case 'devolucao_capital': return 'bg-cyan-100 text-cyan-800';
      case 'gasto': return 'bg-red-100 text-red-800';
      case 'investimento': return 'bg-purple-100 text-purple-800';
      case 'ENTRADA_LOCACAO': return 'bg-green-100 text-green-800';
      case 'entrada_locacao': return 'bg-green-100 text-green-800';
      case 'perda': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransacoesFiltradas = () => {
    return transacoes.filter((transacao) => {
      const matchTipo = filtroTipo === 'todos' || transacao.tipo === filtroTipo;
      const matchCategoria = filtroCategoria === 'todas' || transacao.categoria === filtroCategoria;
      const matchBusca = filtroBusca === '' || 
        transacao.descricao?.toLowerCase().includes(filtroBusca.toLowerCase()) ||
        transacao.categoria?.toLowerCase().includes(filtroBusca.toLowerCase());
      const matchPeriodo = filtroPeriodo === 'todos' || 
        (new Date(transacao.data) >= new Date(dataInicio) && new Date(transacao.data) <= new Date(dataFim));
      return matchTipo && matchCategoria && matchBusca && matchPeriodo;
    });
  };

  const getTotalFiltrado = () => {
    return getTransacoesFiltradas().reduce((sum, t) => {
      if (t.tipo === 'gasto' || t.tipo === 'perda' || t.tipo === 'devolucao_capital') return sum - t.valor;
      if (t.tipo === 'investimento') return sum; // Investimentos não são somados no total
      return sum + t.valor;
    }, 0);
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
            <h1 className="text-xl font-bold text-gray-900">Lançamentos Financeiros</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Buscar..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm w-40"
              />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="ENTRADA_LOCACAO">Entrada de Locação</option>
                <option value="injecao_capital">Injeção de Capital</option>
                <option value="devolucao_capital">Devolução de Capital</option>
                <option value="gasto">Gasto</option>
                <option value="investimento">Investimento</option>
                <option value="perda">Perda/Roubo</option>
              </select>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
                disabled={filtroTipo === 'todos' || filtroTipo === 'injecao_capital' || filtroTipo === 'perda' || filtroTipo === 'ENTRADA_LOCACAO' || filtroTipo === 'devolucao_capital'}
              >
                <option value="todas">Todas as Categorias</option>
                {filtroTipo === 'gasto' && (
                  <>
                    <option value="manutencao">Manutenção</option>
                    <option value="transporte">Transporte</option>
                    <option value="marketing">Marketing</option>
                    <option value="outros">Outros</option>
                  </>
                )}
                {filtroTipo === 'investimento' && (
                  <>
                    <option value="brinquedo">Compra de Brinquedo</option>
                    <option value="equipamento">Equipamento</option>
                    <option value="reforma">Reforma</option>
                    <option value="outros">Outros</option>
                  </>
                )}
              </select>
            </div>
            <button
              onClick={() => {
                setEditandoTransacao(null);
                setMostrarFormulario(true);
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm"
            >
              + Novo Lançamento
            </button>
          </div>

          <div className="flex flex-wrap gap-3 items-center bg-gray-50 p-3 rounded-lg">
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
            >
              <option value="todos">Todos os Períodos</option>
              <option value="mes">Este Mês</option>
              <option value="mes_passado">Mês Passado</option>
              <option value="mes_que_vem">Mês que Vem</option>
              <option value="customizado">Personalizado</option>
            </select>
            {filtroPeriodo === 'customizado' && (
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
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
                  placeholderText="Data início"
                />
                <span className="text-gray-500">até</span>
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
                  className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
                  placeholderText="Data fim"
                />
              </>
            )}
          </div>
        </div>

        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              {editandoTransacao ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="injecao_capital">Injeção de Capital</option>
                  <option value="devolucao_capital">Devolução de Capital</option>
                  <option value="gasto">Gasto</option>
                  <option value="investimento">Investimento</option>
                  <option value="perda">Perda/Roubo</option>
                </select>
              </div>

              {(formData.tipo === 'investimento' || formData.tipo === 'perda') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origem do Recurso</label>
                  <select
                    value={formData.origem}
                    onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  >
                    <option value="caixa_empresa">Caixa da Empresa</option>
                    <option value="capital_externo">Capital Externo/Próprio</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.tipo === 'investimento' 
                      ? 'Caixa da Empresa: conta como gasto no lucro. Capital Externo: não afeta o lucro.'
                      : 'Caixa da Empresa: conta como prejuízo. Capital Externo: não afeta o lucro.'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <DatePicker
                  selected={formData.data ? new Date(formData.data + 'T00:00:00') : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setFormData({ ...formData, data: `${year}-${month}-${day}` });
                    } else {
                      setFormData({ ...formData, data: '' });
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                  placeholderText="Selecione a data"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>

              {(formData.tipo === 'gasto' || formData.tipo === 'investimento') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  >
                    <option value="">Selecione...</option>
                    {formData.tipo === 'gasto' ? (
                      <>
                        <option value="manutencao">Manutenção</option>
                        <option value="transporte">Transporte</option>
                        <option value="marketing">Marketing</option>
                        <option value="outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="brinquedo">Compra de Brinquedo</option>
                        <option value="equipamento">Equipamento</option>
                        <option value="reforma">Reforma</option>
                        <option value="outros">Outros</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                >
                  {editandoTransacao ? 'Salvar Alterações' : 'Criar Lançamento'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setEditandoTransacao(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <table className="w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getTransacoesFiltradas().map((transacao) => (
                <tr key={transacao.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <div className="text-sm text-gray-900">
                      {(() => {
                        const [year, month, day] = transacao.data.split('-');
                        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR');
                      })()}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoColor(transacao.tipo)}`}>
                      {getTipoLabel(transacao.tipo)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs max-w-xs truncate">
                    <div className="text-sm text-gray-900">{transacao.descricao}</div>
                    {transacao.locacao_id && (
                      <div className="text-xs text-gray-500">Locação #{transacao.locacao_id}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <div className="text-sm text-gray-500">{transacao.categoria || '-'}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <div className={`text-sm font-medium ${
                      transacao.tipo === 'gasto' || transacao.tipo === 'perda' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transacao.tipo === 'gasto' || transacao.tipo === 'perda' ? '-' : '+'} R$ {transacao.valor.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => handleEdit(transacao)}
                        className="text-blue-600 hover:text-blue-900 font-semibold text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(transacao.id)}
                        className="text-red-600 hover:text-red-900 font-semibold text-xs"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold">
              <tr>
                <td colSpan={4} className="px-3 py-3 text-right text-xs">
                  Total:
                </td>
                <td className={`px-3 py-3 text-xs ${getTotalFiltrado() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {getTotalFiltrado().toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
