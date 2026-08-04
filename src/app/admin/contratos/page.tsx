'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Eye, Edit, Trash2, ArrowLeft, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Contrato {
  id: string;
  locacao_id: string;
  cliente_nome: string;
  cliente_cpf: string;
  data_evento: string;
  local_evento: string;
  valor_total: number;
  status: string;
  data_contrato: string;
}

interface Locacao {
  id: string;
  cliente: {
    nome: string;
  };
  data_evento: string;
  valor_total: number;
  status: string;
}

export default function AdminContratos() {
  const router = useRouter();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null);
  const [selectedLocacao, setSelectedLocacao] = useState<string>('');

  useEffect(() => {
    fetchContratos();
    fetchLocacoes();
  }, []);

  const fetchContratos = async () => {
    try {
      const response = await fetch('/api/admin/contratos');
      const data = await response.json();
      setContratos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocacoes = async () => {
    try {
      const response = await fetch('/api/admin/locacoes');
      const data = await response.json();
      setLocacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar locações:', error);
    }
  };

  const handleCreate = () => {
    setEditingContrato(null);
    setSelectedLocacao('');
    setShowForm(true);
  };

  const handleEdit = (contrato: Contrato) => {
    setEditingContrato(contrato);
    setSelectedLocacao(contrato.locacao_id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este contrato?')) return;

    try {
      await fetch(`/api/admin/contratos/${id}`, { method: 'DELETE' });
      fetchContratos();
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
    }
  };

  const handleView = (id: string) => {
    router.push(`/admin/contratos/${id}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      RASCUNHO: { icon: Clock, color: 'bg-gray-100 text-gray-700', label: 'Rascunho' },
      PENDENTE_ASSINATURA: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pendente Assinatura' },
      ASSINADO: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Assinado' },
      CANCELADO: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Cancelado' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.RASCUNHO;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
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
              className="flex items-center gap-2 text-gray-800 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1 className="text-xl font-bold text-gray-900">Gestão de Contratos</h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue-500 text-white rounded-lg hover:bg-primary-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Novo Contrato</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          <ContratoForm
            locacoes={locacoes}
            editingContrato={editingContrato}
            selectedLocacao={selectedLocacao}
            onSave={() => {
              setShowForm(false);
              setEditingContrato(null);
              setSelectedLocacao('');
              fetchContratos();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingContrato(null);
              setSelectedLocacao('');
            }}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Contratos</h2>
              <p className="text-gray-600 mt-1">Gerencie os contratos de locação</p>
            </div>

            {contratos.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato encontrado</h3>
                <p className="text-gray-500 mb-4">Crie seu primeiro contrato para começar</p>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-primary-blue-500 text-white rounded-lg hover:bg-primary-blue-600 transition-colors"
                >
                  Criar Contrato
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CPF
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Local
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contratos.map((contrato) => (
                      <tr key={contrato.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {contrato.cliente_nome}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {contrato.cliente_cpf}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatarData(contrato.data_evento)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {contrato.local_evento}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatarMoeda(contrato.valor_total)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(contrato.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(contrato.id)}
                              className="text-primary-blue-600 hover:text-primary-blue-700"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(contrato)}
                              className="text-primary-green-600 hover:text-primary-green-700"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(contrato.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ContratoForm({
  locacoes,
  editingContrato,
  selectedLocacao,
  onSave,
  onCancel,
}: {
  locacoes: Locacao[];
  editingContrato: Contrato | null;
  selectedLocacao: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    locacao_id: selectedLocacao,
    cliente_nome: editingContrato?.cliente_nome || '',
    cliente_cpf: editingContrato?.cliente_cpf || '',
    cliente_rg: '',
    cliente_nascimento: '',
    cliente_endereco: '',
    cliente_numero: '',
    cliente_complemento: '',
    cliente_bairro: '',
    cliente_cidade: '',
    cliente_estado: '',
    cliente_cep: '',
    cliente_telefone: '',
    cliente_email: '',
    data_evento: editingContrato?.data_evento || '',
    horario_inicio: '',
    horario_fim: '',
    local_evento: editingContrato?.local_evento || '',
    valor_total: editingContrato?.valor_total || 0,
    valor_sinal: 0,
    forma_pagamento: '',
    clausulas_adicionais: '',
    observacoes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingContrato 
        ? `/api/admin/contratos/${editingContrato.id}`
        : '/api/admin/contratos';
      
      const method = editingContrato ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
    }
  };

  // Se selecionar uma locação, preencher dados automaticamente
  const handleLocacaoChange = (locacaoId: string) => {
    const locacao = locacoes.find(l => l.id === locacaoId);
    if (locacao) {
      setFormData({
        ...formData,
        locacao_id: locacaoId,
        cliente_nome: locacao.cliente.nome,
        data_evento: locacao.data_evento,
        valor_total: locacao.valor_total,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {editingContrato ? 'Editar Contrato' : 'Novo Contrato'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Locação */}
        {!editingContrato && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locação *
            </label>
            <select
              value={formData.locacao_id}
              onChange={(e) => handleLocacaoChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            >
              <option value="">Selecione uma locação</option>
              {locacoes.map((locacao) => (
                <option key={locacao.id} value={locacao.id}>
                  {locacao.cliente.nome} - {new Date(locacao.data_evento).toLocaleDateString('pt-BR')} - R$ {locacao.valor_total}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dados do Cliente */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.cliente_nome}
                onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF *
              </label>
              <input
                type="text"
                value={formData.cliente_cpf}
                onChange={(e) => setFormData({ ...formData, cliente_cpf: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RG
              </label>
              <input
                type="text"
                value={formData.cliente_rg}
                onChange={(e) => setFormData({ ...formData, cliente_rg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.cliente_nascimento}
                onChange={(e) => setFormData({ ...formData, cliente_nascimento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço *
              </label>
              <input
                type="text"
                value={formData.cliente_endereco}
                onChange={(e) => setFormData({ ...formData, cliente_endereco: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número *
              </label>
              <input
                type="text"
                value={formData.cliente_numero}
                onChange={(e) => setFormData({ ...formData, cliente_numero: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complemento
              </label>
              <input
                type="text"
                value={formData.cliente_complemento}
                onChange={(e) => setFormData({ ...formData, cliente_complemento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bairro *
              </label>
              <input
                type="text"
                value={formData.cliente_bairro}
                onChange={(e) => setFormData({ ...formData, cliente_bairro: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CEP *
              </label>
              <input
                type="text"
                value={formData.cliente_cep}
                onChange={(e) => setFormData({ ...formData, cliente_cep: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade *
              </label>
              <input
                type="text"
                value={formData.cliente_cidade}
                onChange={(e) => setFormData({ ...formData, cliente_cidade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <input
                type="text"
                value={formData.cliente_estado}
                onChange={(e) => setFormData({ ...formData, cliente_estado: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="text"
                value={formData.cliente_telefone}
                onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.cliente_email}
                onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Dados do Evento */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Evento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do Evento *
              </label>
              <input
                type="date"
                value={formData.data_evento}
                onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário Início *
              </label>
              <input
                type="time"
                value={formData.horario_inicio}
                onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário Fim *
              </label>
              <input
                type="time"
                value={formData.horario_fim}
                onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local do Evento *
              </label>
              <input
                type="text"
                value={formData.local_evento}
                onChange={(e) => setFormData({ ...formData, local_evento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Valores</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Total *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valor_total}
                onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Sinal
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valor_sinal}
                onChange={(e) => setFormData({ ...formData, valor_sinal: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forma de Pagamento *
              </label>
              <select
                value={formData.forma_pagamento}
                onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              >
                <option value="">Selecione</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="BOLETO">Boleto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cláusulas Adicionais */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cláusulas Adicionais</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cláusulas Personalizadas
            </label>
            <textarea
              value={formData.clausulas_adicionais}
              onChange={(e) => setFormData({ ...formData, clausulas_adicionais: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              rows={4}
              placeholder="Adicione cláusulas específicas para este contrato..."
            />
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            rows={3}
            placeholder="Observações gerais sobre o contrato..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-blue-500 text-white rounded-lg hover:bg-primary-blue-600 transition-colors"
          >
            Salvar Contrato
          </button>
        </div>
      </form>
    </div>
  );
}
