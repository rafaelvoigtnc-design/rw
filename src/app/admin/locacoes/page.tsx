'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, ArrowUpDown, X, Calendar, MapPin, Phone, DollarSign, Clock, User, Package, Edit, Trash2, Save } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  endereco?: string;
}

interface Brinquedo {
  id: string;
  nome: string;
  tema_layout: string;
}

interface Locacao {
  id: string;
  cliente_id: string;
  cliente_nome?: string; // Campo adicionado para evitar problema de busca
  data_evento: string;
  horario_inicio: string;
  horario_fim: string;
  endereco: string;
  local_evento?: string;
  valor_total: number;
  sinal_pago: number;
  status_pagamento: string;
  status_locacao: string;
  cuidador_nome?: string;
  cuidador_valor?: number;
  observacoes?: string;
  criado_em: string;
  locacao_item?: Array<{
    brinquedo?: {
      nome: string;
    };
    brinquedo_nome?: string;
  }>;
}

const generateHorarios = () => {
  const horarios = [];
  for (let hora = 6; hora <= 22; hora++) {
    horarios.push(`${hora}:00`);
    horarios.push(`${hora}:30`);
  }
  return horarios;
};

export default function AdminLocacoes() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [brinquedos, setBrinquedos] = useState<Brinquedo[]>([]);
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [conflitos, setConflitos] = useState<any[]>([]);
  
  // Filtros e busca
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPagamento, setFiltroPagamento] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('data_desc');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Drawer de detalhes
  const [locacaoSelecionada, setLocacaoSelecionada] = useState<Locacao | null>(null);
  const [mostrarDrawer, setMostrarDrawer] = useState(false);
  
  // Busca de cliente no formulário
  const [buscaCliente, setBuscaCliente] = useState('');
  
  // Modal de edição
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [editFormData, setEditFormData] = useState({
    data_evento: '',
    horario_inicio: '',
    horario_fim: '',
    endereco: '',
    local_evento: '',
    status_pagamento: '',
    status_locacao: '',
    valor_total: 0,
    sinal_pago: 0,
    cuidador_nome: '',
    cuidador_valor: 0,
    observacoes: '',
  });
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    data_evento: '',
    horario_inicio: '',
    horario_fim: '',
    dia_inteiro: true,
    endereco: '',
    local_evento: '',
    brinquedos: [] as Array<{ brinquedo_id: string; nome: string }>,
    valor_total: 0,
    valor_sinal: 0,
    status_pagamento: 'pago',
    status_locacao: 'concluida',
    cuidador_nome: '',
    cuidador_valor: 0,
    observacoes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Atualização ao vivo via localStorage events
  useEffect(() => {
    const fetchClientes = () => {
      const timestamp = new Date().getTime();
      fetch(`/api/admin/clientes?t=${timestamp}`)
        .then(res => res.json())
        .then(data => setClientes(data))
        .catch(err => console.error('Erro ao atualizar clientes:', err));
    };

    // Escutar mudanças no localStorage (quando outras abas modificam)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clientes_updated') {
        console.log('Clientes atualizados em outra aba, recarregando...');
        fetchClientes();
      }
    };

    // Polling como fallback (a cada 5 segundos)
    const interval = setInterval(fetchClientes, 5000);

    // Event listener para quando a aba ficar visível
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchClientes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', fetchClientes);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', fetchClientes);
    };
  }, []);

  const fetchData = async () => {
    try {
      const timestamp = new Date().getTime();
      const [clientesRes, brinqRes, locacoesRes] = await Promise.all([
        fetch(`/api/admin/clientes?t=${timestamp}`),
        fetch('/api/brinquedos'),
        fetch('/api/admin/locacoes'),
      ]);
      const clientesData = await clientesRes.json();
      const brinqData = await brinqRes.json();
      const locacoesData = await locacoesRes.json();
      setClientes(clientesData);
      setBrinquedos(brinqData);
      setLocacoes(locacoesData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflitos([]);

    console.log('Tentando criar locação');
    console.log('FormData:', formData);

    try {
      const payload = {
        ...formData,
        cliente_id: formData.cliente_id,
      };

      console.log('Payload enviado:', payload);

      const response = await fetch('/api/admin/locacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        if (data.conflitos) {
          setConflitos(data.conflitos);
          return;
        }
        throw new Error(data.error || 'Erro ao criar locação');
      }

      setMostrarFormulario(false);
      resetForm();
      fetchData(); // Recarregar locações
      alert('Locação criada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar locação:', error);
      alert(error.message || 'Erro ao criar locação');
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      cliente_novo: {
        nome: '',
        telefone: '',
        email: '',
        endereco: '',
      },
      data_evento: '',
      horario_inicio: '',
      horario_fim: '',
      dia_inteiro: true,
      endereco: '',
      brinquedos: [],
      valor_total: 0,
      valor_sinal: 0,
      status_pagamento: 'pago',
      status_locacao: 'concluida',
      cuidador_nome: '',
      cuidador_valor: 0,
      observacoes: '',
    });
    setConflitos([]);
  };

  // Função para filtrar e ordenar locações
  const locacoesFiltradas = locacoes.filter(locacao => {
    // Usar cliente_nome salvo na locação ou buscar na lista de clientes
    const clienteNome = (locacao.cliente_nome || clientes.find(c => c.id === locacao.cliente_id)?.nome || '').toLowerCase();
    const endereco = locacao.endereco.toLowerCase();
    const termoBusca = busca.toLowerCase();
    
    const matchBusca = clienteNome.includes(termoBusca) || 
                      endereco.includes(termoBusca) ||
                      locacao.id.includes(termoBusca);
    
    const matchStatus = filtroStatus === 'todos' || 
                       locacao.status_locacao?.toLowerCase() === filtroStatus.toLowerCase();
    
    const matchPagamento = filtroPagamento === 'todos' || 
                          locacao.status_pagamento?.toLowerCase() === filtroPagamento.toLowerCase();
    
    return matchBusca && matchStatus && matchPagamento;
  }).sort((a, b) => {
    switch (ordenacao) {
      case 'data_asc':
        return new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime();
      case 'data_desc':
        return new Date(b.data_evento).getTime() - new Date(a.data_evento).getTime();
      case 'valor_asc':
        return a.valor_total - b.valor_total;
      case 'valor_desc':
        return b.valor_total - a.valor_total;
      case 'cliente_asc':
        const clienteA = (a.cliente_nome || clientes.find(c => c.id === a.cliente_id)?.nome || '').toLowerCase();
        const clienteB = (b.cliente_nome || clientes.find(c => c.id === b.cliente_id)?.nome || '').toLowerCase();
        return clienteA.localeCompare(clienteB);
      default:
        return 0;
    }
  });

  const handleLocacaoClick = (locacao: Locacao) => {
    setLocacaoSelecionada(locacao);
    setMostrarDrawer(true);
  };

  const handleEditar = () => {
    if (locacaoSelecionada) {
      setEditFormData({
        data_evento: locacaoSelecionada.data_evento,
        horario_inicio: locacaoSelecionada.horario_inicio,
        horario_fim: locacaoSelecionada.horario_fim,
        endereco: locacaoSelecionada.endereco,
        local_evento: locacaoSelecionada.local_evento || '',
        status_pagamento: locacaoSelecionada.status_pagamento,
        status_locacao: locacaoSelecionada.status_locacao,
        valor_total: locacaoSelecionada.valor_total,
        sinal_pago: locacaoSelecionada.sinal_pago,
        cuidador_nome: locacaoSelecionada.cuidador_nome || '',
        cuidador_valor: locacaoSelecionada.cuidador_valor || 0,
        observacoes: locacaoSelecionada.observacoes || '',
      });
      setMostrarDrawer(false);
      setMostrarModalEdicao(true);
    }
  };

  const handleSalvarEdicao = async () => {
    if (!locacaoSelecionada) return;

    console.log('ID da locação selecionada:', locacaoSelecionada.id);
    console.log('URL da requisição:', `/api/admin/locacoes/${locacaoSelecionada.id}`);
    console.log('Dados sendo enviados:', editFormData);

    try {
      const response = await fetch(`/api/admin/locacoes/${locacaoSelecionada.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      console.log('Status da resposta:', response.status);
      const responseData = await response.json();
      console.log('Resposta da API:', responseData);

      if (response.ok) {
        alert('Locação atualizada com sucesso!');
        setMostrarModalEdicao(false);
        fetchData();
        setLocacaoSelecionada(null);
      } else {
        alert('Erro ao atualizar: ' + responseData.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar locação:', error);
      alert('Erro ao atualizar locação');
    }
  };

  const handleExcluir = async () => {
    if (!locacaoSelecionada) return;

    console.log('ID da locação para excluir:', locacaoSelecionada.id);
    console.log('URL da requisição:', `/api/admin/locacoes/${locacaoSelecionada.id}`);

    if (confirm('Tem certeza que deseja excluir esta locação? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch(`/api/admin/locacoes/${locacaoSelecionada.id}`, {
          method: 'DELETE',
        });

        console.log('Status da resposta DELETE:', response.status);
        const responseData = await response.json();
        console.log('Resposta da API DELETE:', responseData);

        if (response.ok) {
          alert('Locação excluída com sucesso!');
          setMostrarDrawer(false);
          fetchData();
          setLocacaoSelecionada(null);
        } else {
          alert('Erro ao excluir: ' + responseData.error);
        }
      } catch (error) {
        console.error('Erro ao excluir locação:', error);
        alert('Erro ao excluir locação');
      }
    }
  };

  const adicionarBrinquedo = (brinquedoId: string) => {
    const brinquedo = brinquedos.find(b => b.id === brinquedoId);
    if (brinquedo && !formData.brinquedos.find(b => b.brinquedo_id === brinquedoId)) {
      setFormData({
        ...formData,
        brinquedos: [...formData.brinquedos, { brinquedo_id: brinquedoId, nome: brinquedo.nome }],
      });
    }
  };

  const removerBrinquedo = (brinquedoId: string) => {
    setFormData({
      ...formData,
      brinquedos: formData.brinquedos.filter(b => b.brinquedo_id !== brinquedoId),
    });
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
            <h1 className="text-xl font-bold text-gray-900">Agenda de Locações</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => {
              resetForm();
              setMostrarFormulario(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
          >
            + Nova Locação
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Nova Locação</h2>
            
            {conflitos.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="text-red-800 font-semibold mb-2">Conflitos de Horário Detectados</h3>
                <ul className="text-red-700 space-y-1">
                  {conflitos.map((conflito, index) => (
                    <li key={index}>
                      <strong>{conflito.brinquedo}:</strong> {conflito.locacaoExistente}
                    </li>
                  ))}
                </ul>
                <p className="text-red-600 mt-2 text-sm">Por favor, ajuste os horários ou remova o brinquedo em conflito.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <input
                  type="text"
                  placeholder="Buscar cliente pelo nome..."
                  value={buscaCliente}
                  onChange={(e) => setBuscaCliente(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 mb-2"
                />
                <select
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes
                    .filter((cliente) => 
                      cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
                      (cliente.telefone && cliente.telefone.includes(buscaCliente))
                    )
                    .map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}{cliente.telefone ? ` - ${cliente.telefone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data e Horários */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data do Evento</label>
                <DatePicker
                  selected={formData.data_evento ? new Date(formData.data_evento + 'T00:00:00') : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setFormData({ ...formData, data_evento: `${year}-${month}-${day}` });
                    } else {
                      setFormData({ ...formData, data_evento: '' });
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

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="dia_inteiro"
                  checked={formData.dia_inteiro}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      dia_inteiro: e.target.checked,
                      horario_inicio: e.target.checked ? '00:00' : '',
                      horario_fim: e.target.checked ? '23:59' : ''
                    });
                  }}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="dia_inteiro" className="text-sm font-medium text-gray-700">
                  Dia inteiro (00:00 - 23:59)
                </label>
              </div>

              {!formData.dia_inteiro && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário Início</label>
                    <select
                      value={formData.horario_inicio}
                      onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      required
                    >
                      <option value="">Selecione</option>
                      {generateHorarios().map((hora) => (
                        <option key={hora} value={hora}>{hora}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário Fim</label>
                    <select
                      value={formData.horario_fim}
                      onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      required
                    >
                      <option value="">Selecione</option>
                      {generateHorarios().map((hora) => (
                        <option key={hora} value={hora}>{hora}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Rua)</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    placeholder="Ex: Rua das Flores, 123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local do Evento</label>
                  <input
                    type="text"
                    value={formData.local_evento}
                    onChange={(e) => setFormData({ ...formData, local_evento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    placeholder="Ex: Pavilhão de Eventos"
                  />
                </div>
              </div>

              {/* Brinquedos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brinquedos</label>
                <select
                  onChange={(e) => adicionarBrinquedo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-gray-900"
                >
                  <option value="">Adicionar brinquedo...</option>
                  {brinquedos.map((brinquedo) => (
                    <option key={brinquedo.id} value={brinquedo.id}>
                      {brinquedo.nome}
                    </option>
                  ))}
                </select>

                {formData.brinquedos.length > 0 && (
                  <div className="space-y-2">
                    {formData.brinquedos.map((brinquedo) => (
                      <div key={brinquedo.brinquedo_id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-900">{brinquedo.nome}</span>
                        <button
                          type="button"
                          onClick={() => removerBrinquedo(brinquedo.brinquedo_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Valores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                  <input
                    type="number"
                    value={formData.valor_total}
                    onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Sinal</label>
                  <input
                    type="number"
                    value={formData.valor_sinal}
                    onChange={(e) => setFormData({ ...formData, valor_sinal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Pagamento</label>
                  <select
                    value={formData.status_pagamento}
                    onChange={(e) => setFormData({ ...formData, status_pagamento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="parcial">Parcial</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Locação</label>
                  <select
                    value={formData.status_locacao}
                    onChange={(e) => setFormData({ ...formData, status_locacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  >
                    <option value="confirmada">Confirmada</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Cuidador */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cuidador (opcional)</label>
                  <input
                    type="text"
                    value={formData.cuidador_nome}
                    onChange={(e) => setFormData({ ...formData, cuidador_nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Cuidador (opcional)</label>
                  <input
                    type="number"
                    value={formData.cuidador_valor}
                    onChange={(e) => setFormData({ ...formData, cuidador_valor: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                >
                  Criar Locação
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Locações ({locacoesFiltradas.length})</h3>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {/* Barra de busca e filtros */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, endereço ou ID..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            {mostrarFiltros && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status da Locação</label>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  >
                    <option value="todos">Todos</option>
                    <option value="orcamento">Orçamento</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status de Pagamento</label>
                  <select
                    value={filtroPagamento}
                    onChange={(e) => setFiltroPagamento(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  >
                    <option value="todos">Todos</option>
                    <option value="pendente">Pendente</option>
                    <option value="parcial">Parcial</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                  <select
                    value={ordenacao}
                    onChange={(e) => setOrdenacao(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  >
                    <option value="data_desc">Data (mais recente)</option>
                    <option value="data_asc">Data (mais antiga)</option>
                    <option value="valor_desc">Valor (maior)</option>
                    <option value="valor_asc">Valor (menor)</option>
                    <option value="cliente_asc">Cliente (A-Z)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {locacoesFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma locação encontrada com os filtros atuais.</p>
              {(busca || filtroStatus !== 'todos' || filtroPagamento !== 'todos') && (
                <button
                  onClick={() => {
                    setBusca('');
                    setFiltroStatus('todos');
                    setFiltroPagamento('todos');
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {locacoesFiltradas.map((locacao) => {
                const cliente = clientes.find(c => c.id === locacao.cliente_id);
                const clienteNome = locacao.cliente_nome || cliente?.nome || 'Cliente não encontrado';
                return (
                  <div 
                    key={locacao.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleLocacaoClick(locacao)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {clienteNome}
                          </h4>
                          <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                            locacao.status_locacao?.toUpperCase() === 'CONFIRMADA' ? 'bg-blue-100 text-blue-800' :
                            locacao.status_locacao?.toUpperCase() === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' :
                            locacao.status_locacao?.toUpperCase() === 'CONCLUIDA' ? 'bg-green-100 text-green-800' :
                            locacao.status_locacao?.toUpperCase() === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {locacao.status_locacao}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {(() => {
                              const [year, month, day] = locacao.data_evento.split('-');
                              return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR');
                            })()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {locacao.horario_inicio} às {locacao.horario_fim}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-xs">{locacao.endereco}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900">R$ {locacao.valor_total.toFixed(2)}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded ${
                          locacao.status_pagamento?.toUpperCase() === 'PAGO' ? 'bg-green-100 text-green-800' :
                          locacao.status_pagamento?.toUpperCase() === 'PARCIAL' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {locacao.status_pagamento}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer de detalhes da locação */}
        {mostrarDrawer && locacaoSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Detalhes da Locação</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleEditar}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={handleExcluir}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                  <button
                    onClick={() => setMostrarDrawer(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Informações do Cliente */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Cliente
                  </h3>
                  {(() => {
                    const cliente = clientes.find(c => c.id === locacaoSelecionada.cliente_id);
                    const clienteNome = locacaoSelecionada.cliente_nome || cliente?.nome || 'Cliente não encontrado';
                    
                    if (cliente) {
                      return (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <p className="font-medium text-gray-900">{clienteNome}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {cliente.telefone}
                          </div>
                          {cliente.endereco && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              {cliente.endereco}
                            </div>
                          )}
                        </div>
                      );
                    } else if (locacaoSelecionada.cliente_nome) {
                      return (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium text-gray-900">{clienteNome}</p>
                          <p className="text-sm text-gray-500">Informações de contato não disponíveis</p>
                        </div>
                      );
                    } else {
                      return (
                        <p className="text-red-600">Cliente não encontrado</p>
                      );
                    }
                  })()}
                </div>

                {/* Informações do Evento */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Informações do Evento
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">
                        {(() => {
                          const [year, month, day] = locacaoSelecionada.data_evento.split('-');
                          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR');
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">
                        {locacaoSelecionada.horario_inicio} às {locacaoSelecionada.horario_fim}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{locacaoSelecionada.endereco}</span>
                    </div>
                    {locacaoSelecionada.local_evento && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 font-medium">Local: {locacaoSelecionada.local_evento}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Brinquedos */}
                {locacaoSelecionada.locacao_item && locacaoSelecionada.locacao_item.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Brinquedos
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {locacaoSelecionada.locacao_item.map((item: any, index: number) => (
                        <div key={index} className="text-gray-900">
                          {item.brinquedo_nome || item.brinquedo?.nome || 'Brinquedo não informado'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valores */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Valores
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Total:</span>
                      <span className="font-semibold text-gray-900">R$ {locacaoSelecionada.valor_total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sinal Pago:</span>
                      <span className="font-semibold text-gray-900">R$ {locacaoSelecionada.sinal_pago.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Restante:</span>
                      <span className="font-semibold text-gray-900">
                        R$ {(locacaoSelecionada.valor_total - locacaoSelecionada.sinal_pago).toFixed(2)}
                      </span>
                    </div>
                    {locacaoSelecionada.cuidador_valor && (
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Cuidador:</span>
                        <span className="font-semibold text-gray-900">R$ {locacaoSelecionada.cuidador_valor.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">Locação:</span>
                      <span className={`ml-2 inline-block px-3 py-1 text-sm rounded ${
                        locacaoSelecionada.status_locacao?.toUpperCase() === 'CONFIRMADA' ? 'bg-blue-100 text-blue-800' :
                        locacaoSelecionada.status_locacao?.toUpperCase() === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' :
                        locacaoSelecionada.status_locacao?.toUpperCase() === 'CONCLUIDA' ? 'bg-green-100 text-green-800' :
                        locacaoSelecionada.status_locacao?.toUpperCase() === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {locacaoSelecionada.status_locacao}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">Pagamento:</span>
                      <span className={`ml-2 inline-block px-3 py-1 text-sm rounded ${
                        locacaoSelecionada.status_pagamento?.toUpperCase() === 'PAGO' ? 'bg-green-100 text-green-800' :
                        locacaoSelecionada.status_pagamento?.toUpperCase() === 'PARCIAL' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {locacaoSelecionada.status_pagamento}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cuidador */}
                {locacaoSelecionada.cuidador_nome && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Cuidador</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900">{locacaoSelecionada.cuidador_nome}</p>
                      {locacaoSelecionada.cuidador_valor && (
                        <p className="text-sm text-gray-600">Valor: R$ {locacaoSelecionada.cuidador_valor.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {locacaoSelecionada.observacoes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{locacaoSelecionada.observacoes}</p>
                    </div>
                  </div>
                )}

                {/* Informações do Sistema */}
                <div className="text-sm text-gray-500 pt-4 border-t">
                  <p>ID da Locação: {locacaoSelecionada.id}</p>
                  <p>Criado em: {new Date(locacaoSelecionada.criado_em).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {mostrarModalEdicao && locacaoSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Editar Locação</h2>
                <button
                  onClick={() => {
                    setMostrarModalEdicao(false);
                    setMostrarDrawer(true);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Data e Horários */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data do Evento</label>
                    <input
                      type="date"
                      value={editFormData.data_evento}
                      onChange={(e) => setEditFormData({ ...editFormData, data_evento: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário Início</label>
                    <input
                      type="time"
                      value={editFormData.horario_inicio}
                      onChange={(e) => setEditFormData({ ...editFormData, horario_inicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário Fim</label>
                    <input
                      type="time"
                      value={editFormData.horario_fim}
                      onChange={(e) => setEditFormData({ ...editFormData, horario_fim: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                </div>

                {/* Endereço e Local */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Rua)</label>
                    <input
                      type="text"
                      value={editFormData.endereco}
                      onChange={(e) => setEditFormData({ ...editFormData, endereco: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local do Evento</label>
                    <input
                      type="text"
                      value={editFormData.local_evento}
                      onChange={(e) => setEditFormData({ ...editFormData, local_evento: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      placeholder="Ex: Pavilhão de Eventos"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Pagamento</label>
                    <select
                      value={editFormData.status_pagamento}
                      onChange={(e) => setEditFormData({ ...editFormData, status_pagamento: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    >
                      <option value="PENDENTE">Pendente</option>
                      <option value="PARCIAL">Parcial</option>
                      <option value="PAGO">Pago</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Locação</label>
                    <select
                      value={editFormData.status_locacao}
                      onChange={(e) => setEditFormData({ ...editFormData, status_locacao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    >
                      <option value="ORCAMENTO">Orçamento</option>
                      <option value="CONFIRMADA">Confirmada</option>
                      <option value="EM_ANDAMENTO">Em Andamento</option>
                      <option value="CONCLUIDA">Concluída</option>
                      <option value="CANCELADA">Cancelada</option>
                    </select>
                  </div>
                </div>

                {/* Valores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                    <input
                      type="number"
                      value={editFormData.valor_total}
                      onChange={(e) => setEditFormData({ ...editFormData, valor_total: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sinal Pago</label>
                    <input
                      type="number"
                      value={editFormData.sinal_pago}
                      onChange={(e) => setEditFormData({ ...editFormData, sinal_pago: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Cuidador */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cuidador</label>
                    <input
                      type="text"
                      value={editFormData.cuidador_nome}
                      onChange={(e) => setEditFormData({ ...editFormData, cuidador_nome: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Cuidador</label>
                    <input
                      type="number"
                      value={editFormData.cuidador_valor}
                      onChange={(e) => setEditFormData({ ...editFormData, cuidador_valor: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    value={editFormData.observacoes}
                    onChange={(e) => setEditFormData({ ...editFormData, observacoes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    rows={3}
                  />
                </div>

                {/* Resumo */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Resumo Financeiro</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Total:</span>
                      <span className="font-medium">R$ {editFormData.valor_total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sinal Pago:</span>
                      <span className="font-medium">R$ {editFormData.sinal_pago.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-gray-600">Restante:</span>
                      <span className="font-semibold text-gray-900">
                        R$ {(editFormData.valor_total - editFormData.sinal_pago).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSalvarEdicao}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </button>
                  <button
                    onClick={() => {
                      setMostrarModalEdicao(false);
                      setMostrarDrawer(true);
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
    </div>
  );
}
