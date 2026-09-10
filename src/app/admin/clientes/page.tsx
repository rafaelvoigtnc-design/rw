'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Plus, Edit, Trash2, X, Phone, Mail, MapPin, Calendar, User, Clock, DollarSign, MessageCircle } from 'lucide-react';
import { updateCliente, deleteCliente, getLocacoesByCliente, getClienteById } from '@/lib/firebase-db';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  criado_em: string;
  origem_cadastro?: string; // 'admin' ou 'site'
}

interface Locacao {
  id: string;
  data_evento: string;
  horario_inicio: string;
  horario_fim: string;
  endereco: string;
  valor_total: number;
  status_pagamento: string;
  status_locacao: string;
}

export default function AdminClientes() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroOrigem, setFiltroOrigem] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('nome_asc');
  
  // Modal de criação/edição
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
  });
  
  // Drawer de detalhes
  const [mostrarDrawer, setMostrarDrawer] = useState(false);
  const [clienteDetalhes, setClienteDetalhes] = useState<any>(null);
  const [locacoesCliente, setLocacoesCliente] = useState<Locacao[]>([]);
  const [carrinhoCliente, setCarrinhoCliente] = useState<any[]>([]);

  useEffect(() => {
    console.log('Carregando dados de clientes...');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/clientes');
      const data = await response.json();
      console.log('Clientes recebidos da API:', data);
      console.log('Quantidade de clientes:', data.length);
      data.forEach((cliente: any) => {
        console.log(`Cliente: ${cliente.nome} (${cliente.email})`);
      });
      setClientes(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const termoBusca = busca.toLowerCase();
    const matchBusca = cliente.nome.toLowerCase().includes(termoBusca) ||
                      cliente.telefone.includes(termoBusca);
    const matchOrigem = filtroOrigem === 'todos' || cliente.origem_cadastro === filtroOrigem;
    return matchBusca && matchOrigem;
  }).sort((a, b) => {
    switch (ordenacao) {
      case 'nome_asc':
        return a.nome.localeCompare(b.nome);
      case 'nome_desc':
        return b.nome.localeCompare(a.nome);
      case 'data_asc':
        return new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime();
      case 'data_desc':
        return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
      default:
        return 0;
    }
  });

  const handleCriar = () => {
    setEditando(false);
    setClienteSelecionado(null);
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      endereco: '',
      cidade: '',
    });
    setMostrarModal(true);
  };

  const handleEditar = async (cliente: Cliente) => {
    console.log('Editando cliente:', cliente);
    console.log('ID do cliente:', cliente.id);
    
    // Recarregar dados do Firebase para verificar se o cliente ainda existe
    const clientesAtualizados = await fetch('/api/admin/clientes').then(res => res.json());
    const clienteNoFirebase = clientesAtualizados.find((c: any) => c.id === cliente.id);
    
    if (!clienteNoFirebase) {
      alert('Erro: Este cliente não existe mais no banco de dados. A lista será atualizada.');
      fetchData();
      return;
    }
    
    setEditando(true);
    setClienteSelecionado(clienteNoFirebase);
    setFormData({
      nome: clienteNoFirebase.nome,
      telefone: clienteNoFirebase.telefone,
      email: clienteNoFirebase.email,
      endereco: clienteNoFirebase.endereco,
      cidade: clienteNoFirebase.cidade || '',
    });
    setMostrarModal(true);
  };

  const handleSalvar = async () => {
    try {
      console.log('=== INICIANDO SALVAMENTO ===');
      console.log('Editando:', editando);
      console.log('Cliente selecionado:', clienteSelecionado);
      console.log('Form data:', formData);

      if (editando && clienteSelecionado) {
        // Para edição, usa função direta do firebase-db
        console.log('Atualizando cliente ID:', clienteSelecionado.id);
        console.log('Tipo do ID:', typeof clienteSelecionado.id);
        console.log('ID como string:', String(clienteSelecionado.id));
        
        await updateCliente(String(clienteSelecionado.id), formData);
        
        console.log('Cliente atualizado com sucesso');
        alert('Cliente atualizado com sucesso!');
        setMostrarModal(false);
        fetchData();
        localStorage.setItem('clientes_updated', Date.now().toString());
      } else {
        // Para criação, usa POST normal
        console.log('Payload de criação:', formData);
        const response = await fetch('/api/admin/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        console.log('Status da resposta:', response.status);
        const responseData = await response.json();
        console.log('Resposta da API:', responseData);

        if (response.ok) {
          alert('Cliente criado com sucesso!');
          setMostrarModal(false);
          fetchData();
          localStorage.setItem('clientes_updated', Date.now().toString());
        } else {
          alert('Erro: ' + responseData.error);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleExcluir = async (cliente: Cliente) => {
    console.log('=== INICIANDO EXCLUSÃO ===');
    console.log('Cliente a excluir:', cliente);
    console.log('ID do cliente:', cliente.id);
    
    // Recarregar dados do Firebase para verificar se o cliente ainda existe
    const clientesAtualizados = await fetch('/api/admin/clientes').then(res => res.json());
    const clienteNoFirebase = clientesAtualizados.find((c: any) => c.id === cliente.id);
    
    if (!clienteNoFirebase) {
      alert('Erro: Este cliente não existe mais no banco de dados. A lista será atualizada.');
      fetchData();
      return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o cliente ${clienteNoFirebase.nome}?`)) {
      try {
        // Verificar se o cliente tem locações
        const locacoes = await getLocacoesByCliente(String(clienteNoFirebase.id));
        
        if (locacoes.length > 0) {
          alert('Não é possível excluir cliente com locações associadas');
          return;
        }

        // Usa função direta do firebase-db
        console.log('Excluindo cliente ID:', String(clienteNoFirebase.id));
        await deleteCliente(String(clienteNoFirebase.id));
        
        console.log('Cliente excluído com sucesso');
        alert('Cliente excluído com sucesso!');
        fetchData();
        localStorage.setItem('clientes_updated', Date.now().toString());
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleVerDetalhes = async (cliente: Cliente) => {
    console.log('Buscando detalhes do cliente:', cliente.id);
    try {
      // Usar a API que já retorna carrinho, favoritos, locações, etc.
      const response = await fetch(`/api/admin/clientes/${cliente.id}`);
      const data = await response.json();

      if (!data.cliente) {
        alert('Cliente não encontrado');
        return;
      }

      setClienteDetalhes(data.cliente);
      setLocacoesCliente(data.locacoes || []);
      setCarrinhoCliente(data.carrinho || []);
      setMostrarDrawer(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      alert('Erro ao buscar detalhes do cliente: ' + (error instanceof Error ? error.message : String(error)));
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
            <h1 className="text-xl font-bold text-gray-900">Gerenciar Clientes</h1>
            <button
              onClick={handleCriar}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Novo Cliente
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filtros e busca */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone ou email..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filtroOrigem}
                onChange={(e) => setFiltroOrigem(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                <option value="todos">Todas Origens</option>
                <option value="admin">Admin</option>
                <option value="site">Site</option>
              </select>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                <option value="nome_asc">Nome (A-Z)</option>
                <option value="nome_desc">Nome (Z-A)</option>
                <option value="data_asc">Data (mais antiga)</option>
                <option value="data_desc">Data (mais recente)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de clientes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Clientes ({clientesFiltrados.length})
            </h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Cidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Origem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Data Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-700">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cliente.nome || 'Sem nome'}</div>
                      <div className="text-sm text-gray-500">{cliente.endereco || 'Sem endereço'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{cliente.telefone || 'Sem telefone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{cliente.cidade || 'Sem cidade'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        cliente.origem_cadastro === 'site' 
                          ? 'bg-purple-100 text-purple-800' 
                          : cliente.origem_cadastro === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cliente.origem_cadastro === 'site' ? '🌐 Site' : cliente.origem_cadastro === 'admin' ? '🔧 Admin' : 'Desconhecido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {cliente.criado_em ? new Date(cliente.criado_em).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleVerDetalhes(cliente)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          title="Ver Detalhes"
                        >
                          <User className="w-4 h-4" />
                          Detalhes
                        </button>
                        <button
                          onClick={() => handleEditar(cliente)}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(cliente)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
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

      {/* Modal de criação/edição */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editando ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Principal forma de contato (opcional)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (para login)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Usado apenas para login (opcional)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-2">
              <button
                onClick={handleSalvar}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
              >
                {editando ? 'Atualizar' : 'Criar'}
              </button>
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer de detalhes */}
      {mostrarDrawer && clienteDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Detalhes do Cliente</h2>
              <button
                onClick={() => setMostrarDrawer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Origem do Cadastro */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  clienteDetalhes.origem_cadastro === 'site' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {clienteDetalhes.origem_cadastro === 'site' ? '🌐 Cadastro via Site' : '🔧 Cadastro via Admin'}
                </span>
              </div>

              {/* Informações pessoais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-gray-900 text-lg">{clienteDetalhes.nome}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {clienteDetalhes.telefone || 'Não informado'}
                  </div>
                  {clienteDetalhes.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {clienteDetalhes.email}
                    </div>
                  )}
                  {clienteDetalhes.endereco && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {clienteDetalhes.endereco}
                    </div>
                  )}
                  {clienteDetalhes.cidade && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {clienteDetalhes.cidade}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Cadastrado em: {new Date(clienteDetalhes.criado_em).toLocaleDateString('pt-BR')}
                  </div>
                  {/* Botão WhatsApp */}
                  {clienteDetalhes.telefone && (
                    <a
                      href={`https://wa.me/55${clienteDetalhes.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chamar no WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Informações específicas para clientes do site */}
              {clienteDetalhes.origem_cadastro === 'site' && (
                <>
                  {/* Carrinho Atual */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Carrinho Atual ({carrinhoCliente.length})
                      {carrinhoCliente.length > 0 && (
                        <span className="ml-2 text-sm font-normal text-amber-600">
                          - Ainda sem locação fechada
                        </span>
                      )}
                    </h3>
                    {carrinhoCliente.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                        Carrinho vazio.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {carrinhoCliente.map((item) => (
                          <div key={item.id} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {item.brinquedo?.nome || 'Brinquedo não encontrado'}
                                </p>
                                {item.brinquedo?.tema_layout && (
                                  <p className="text-sm text-gray-500">Tema: {item.brinquedo.tema_layout}</p>
                                )}
                              </div>
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                No Carrinho
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Histórico de locações (aparece para ambos) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Histórico de Locações ({locacoesCliente.length})
                </h3>
                {locacoesCliente.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                    Nenhuma locação encontrada para este cliente.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {locacoesCliente.map((locacao) => (
                      <div key={locacao.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">
                                {new Date(locacao.data_evento).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {locacao.horario_inicio} às {locacao.horario_fim}
                            </div>
                          </div>
                          <div className="text-right">
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
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{locacao.endereco}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                            locacao.status_locacao?.toUpperCase() === 'CONFIRMADA' ? 'bg-blue-100 text-blue-800' :
                            locacao.status_locacao?.toUpperCase() === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' :
                            locacao.status_locacao?.toUpperCase() === 'CONCLUIDA' ? 'bg-green-100 text-green-800' :
                            locacao.status_locacao?.toUpperCase() === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {locacao.status_locacao}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumo financeiro */}
              {locacoesCliente.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Resumo Financeiro
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Gasto:</p>
                        <p className="text-2xl font-bold text-gray-900">
                          R$ {locacoesCliente.reduce((sum, loc) => sum + loc.valor_total, 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Locações:</p>
                        <p className="text-2xl font-bold text-gray-900">{locacoesCliente.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
