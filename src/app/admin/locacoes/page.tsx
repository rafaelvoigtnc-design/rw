'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
}

interface Brinquedo {
  id: string;
  nome: string;
  tema_layout: string;
}

export default function AdminLocacoes() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [brinquedos, setBrinquedos] = useState<Brinquedo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usarClienteNovo, setUsarClienteNovo] = useState(false);
  const [conflitos, setConflitos] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
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
    endereco: '',
    brinquedos: [] as Array<{ brinquedo_id: string; nome: string }>,
    valor_total: 0,
    valor_sinal: 0,
    status_pagamento: 'pendente',
    status_locacao: 'confirmada',
    cuidador_nome: '',
    cuidador_valor: 0,
    observacoes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientesRes, brinqRes] = await Promise.all([
        fetch('/api/clientes'),
        fetch('/api/brinquedos'),
      ]);
      const clientesData = await clientesRes.json();
      const brinqData = await brinqRes.json();
      setClientes(clientesData);
      setBrinquedos(brinqData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflitos([]);

    try {
      const payload = {
        ...formData,
        cliente_id: usarClienteNovo ? null : formData.cliente_id,
        cliente_novo: usarClienteNovo ? formData.cliente_novo : null,
      };

      const response = await fetch('/api/admin/locacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.conflitos) {
          setConflitos(data.conflitos);
          return;
        }
        throw new Error(data.error || 'Erro ao criar locação');
      }

      setMostrarFormulario(false);
      resetForm();
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
      endereco: '',
      brinquedos: [],
      valor_total: 0,
      valor_sinal: 0,
      status_pagamento: 'pendente',
      status_locacao: 'confirmada',
      cuidador_nome: '',
      cuidador_valor: 0,
      observacoes: '',
    });
    setUsarClienteNovo(false);
    setConflitos([]);
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
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={usarClienteNovo}
                    onChange={(e) => setUsarClienteNovo(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Cadastrar novo cliente</span>
                </label>

                {usarClienteNovo ? (
                  <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                    <input
                      type="text"
                      placeholder="Nome do cliente"
                      value={formData.cliente_novo.nome}
                      onChange={(e) => setFormData({
                        ...formData,
                        cliente_novo: { ...formData.cliente_novo, nome: e.target.value },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Telefone"
                      value={formData.cliente_novo.telefone}
                      onChange={(e) => setFormData({
                        ...formData,
                        cliente_novo: { ...formData.cliente_novo, telefone: e.target.value },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.cliente_novo.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        cliente_novo: { ...formData.cliente_novo, email: e.target.value },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Endereço"
                      value={formData.cliente_novo.endereco}
                      onChange={(e) => setFormData({
                        ...formData,
                        cliente_novo: { ...formData.cliente_novo, endereco: e.target.value },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      required
                    />
                  </div>
                ) : (
                  <select
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.telefone}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Data e Horários */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data do Evento</label>
                  <input
                    type="date"
                    value={formData.data_evento}
                    onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Início</label>
                  <input
                    type="time"
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário Fim</label>
                  <input
                    type="time"
                    value={formData.horario_fim}
                    onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço do Evento</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                />
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
                    onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Sinal</label>
                  <input
                    type="number"
                    value={formData.valor_sinal}
                    onChange={(e) => setFormData({ ...formData, valor_sinal: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
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
                    onChange={(e) => setFormData({ ...formData, cuidador_valor: parseFloat(e.target.value) })}
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
          <h3 className="text-lg font-semibold mb-4">Locações Recentes</h3>
          <p className="text-gray-500">Use o calendário para visualizar todas as locações.</p>
        </div>
      </div>
    </div>
  );
}
