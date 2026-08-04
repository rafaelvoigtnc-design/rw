'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  criado_em: string;
}

interface CarrinhoItem {
  id: string;
  brinquedo: {
    id: string;
    nome: string;
    fotos: string[];
    tema_layout: string;
  };
}

interface Locacao {
  id: string;
  data_evento: string;
  horario_inicio: string;
  horario_fim: string;
  valor_total: number;
  status_pagamento: string;
  status_locacao: string;
  locacao_item: Array<{
    brinquedo: {
      nome: string;
    };
  }>;
}

interface Favorito {
  id: string;
  brinquedo: {
    nome: string;
    fotos: string[];
  };
}

interface Avaliacao {
  id: string;
  texto: string;
  nota: number;
  foto: string | null;
  aprovado_para_exibir: boolean;
  criado_em: string;
}

export default function AdminClienteDetalhes() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/admin/clientes/${id}`);
      const data = await response.json();
      setCliente(data.cliente);
      setCarrinho(data.carrinho);
      setLocacoes(data.locacoes);
      setFavoritos(data.favoritos);
      setAvaliacoes(data.avaliacoes);
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!cliente) {
    return <div className="p-8">Cliente não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              onClick={() => router.push('/admin/clientes')}
              className="text-gray-800 hover:text-gray-900"
            >
              ← Voltar
            </button>
            <h1 className="text-xl font-bold text-gray-900">Detalhes do Cliente</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Dados do Cliente */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Dados de Cadastro</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="font-medium">{cliente.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefone</p>
              <p className="font-medium">{cliente.telefone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{cliente.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Endereço</p>
              <p className="font-medium">{cliente.endereco}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data de Cadastro</p>
              <p className="font-medium">{new Date(cliente.criado_em).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Carrinho Atual */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Carrinho Atual ({carrinho.length} itens)
            {carrinho.length > 0 && (
              <span className="ml-2 text-sm font-normal text-amber-600">
                - Ainda sem locação fechada
              </span>
            )}
          </h2>
          {carrinho.length === 0 ? (
            <p className="text-gray-500">Carrinho vazio.</p>
          ) : (
            <div className="space-y-3">
              {carrinho.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-amber-50 border border-amber-200 rounded">
                  {item.brinquedo.fotos && item.brinquedo.fotos.length > 0 && (
                    <img
                      src={item.brinquedo.fotos[0]}
                      alt={item.brinquedo.nome}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.brinquedo.nome}</p>
                    <p className="text-sm text-gray-500">Tema: {item.brinquedo.tema_layout}</p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    No Carrinho
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico de Locações */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Histórico de Locações ({locacoes.length})</h2>
          {locacoes.length === 0 ? (
            <p className="text-gray-500">Nenhuma locação fechada.</p>
          ) : (
            <div className="space-y-3">
              {locacoes.map((locacao) => (
                <div key={locacao.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        {new Date(locacao.data_evento).toLocaleDateString('pt-BR')} - {locacao.horario_inicio} às {locacao.horario_fim}
                      </p>
                      <p className="text-sm text-gray-500">
                        {locacao.locacao_item.map(item => item.brinquedo.nome).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {locacao.valor_total.toFixed(2)}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          locacao.status_pagamento === 'pago' ? 'bg-green-100 text-green-800' :
                          locacao.status_pagamento === 'parcial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {locacao.status_pagamento}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          locacao.status_locacao === 'concluida' ? 'bg-blue-100 text-blue-800' :
                          locacao.status_locacao === 'cancelada' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {locacao.status_locacao}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favoritos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Favoritos ({favoritos.length})</h2>
          {favoritos.length === 0 ? (
            <p className="text-gray-500">Nenhum favorito marcado.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {favoritos.map((favorito) => (
                <div key={favorito.id} className="border rounded p-3">
                  {favorito.brinquedo.fotos && favorito.brinquedo.fotos.length > 0 && (
                    <img
                      src={favorito.brinquedo.fotos[0]}
                      alt={favorito.brinquedo.nome}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <p className="font-medium text-sm">{favorito.brinquedo.nome}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avaliações */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Avaliações ({avaliacoes.length})</h2>
          {avaliacoes.length === 0 ? (
            <p className="text-gray-500">Nenhuma avaliação deixada.</p>
          ) : (
            <div className="space-y-4">
              {avaliacoes.map((avaliacao) => (
                <div key={avaliacao.id} className="border rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < avaliacao.nota ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-500">({avaliacao.nota}/5)</span>
                  </div>
                  <p className="text-gray-700 italic">"{avaliacao.texto}"</p>
                  {avaliacao.foto && (
                    <img
                      src={avaliacao.foto}
                      alt="Foto da avaliação"
                      className="w-24 h-24 object-cover rounded mt-2"
                    />
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      avaliacao.aprovado_para_exibir ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {avaliacao.aprovado_para_exibir ? 'Aprovada' : 'Pendente'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(avaliacao.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
