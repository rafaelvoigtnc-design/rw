'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Save, ArrowLeft } from 'lucide-react';

interface DadosEmpresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  site: string;
  observacoes: string;
}

export default function AdminDadosEmpresa() {
  const router = useRouter();
  const [dados, setDados] = useState<DadosEmpresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    try {
      const response = await fetch('/api/admin/dados-empresa');
      const data = await response.json();
      console.log('Dados recebidos:', data);
      if (data) {
        setDados(data);
      } else {
        // Criar objeto padrão se não houver dados
        setDados({
          id: '',
          razao_social: '',
          nome_fantasia: 'RW Brinquedos',
          cnpj: '',
          inscricao_estadual: '',
          endereco: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
          telefone: '',
          email: '',
          site: '',
          observacoes: '',
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados da empresa:', error);
      // Criar objeto padrão em caso de erro
      setDados({
        id: '',
        razao_social: '',
        nome_fantasia: 'RW Brinquedos',
        cnpj: '',
        inscricao_estadual: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
        site: '',
        observacoes: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dados) return;

    setSalvando(true);
    setSucesso(false);

    try {
      const response = await fetch('/api/admin/dados-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      if (response.ok) {
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    } finally {
      setSalvando(false);
    }
  };

  const formatarCNPJ = (value: string) => {
    // Remove todos os caracteres não numéricos
    const apenasNumeros = value.replace(/\D/g, '');

    // Aplica a máscara do CNPJ: 00.000.000/0001-00
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 5) {
      return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2)}`;
    } else if (apenasNumeros.length <= 8) {
      return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5)}`;
    } else if (apenasNumeros.length <= 12) {
      return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5, 8)}/${apenasNumeros.slice(8)}`;
    } else {
      return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5, 8)}/${apenasNumeros.slice(8, 12)}-${apenasNumeros.slice(12, 14)}`;
    }
  };

  const formatarCEP = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, '');
    if (apenasNumeros.length <= 5) {
      return apenasNumeros;
    } else {
      return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`;
    }
  };

  const formatarTelefone = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, '');
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    } else {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!dados) {
    return <div className="p-8">Carregando dados...</div>;
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
            <h1 className="text-xl font-bold text-gray-900">Dados da Empresa</h1>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sucesso && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800 font-medium">Dados salvos com sucesso!</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-8 h-8 text-primary-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Informações da Empresa</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Dados Básicos */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razão Social *
                  </label>
                  <input
                    type="text"
                    value={dados.razao_social}
                    onChange={(e) => setDados({ ...dados, razao_social: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Fantasia *
                  </label>
                  <input
                    type="text"
                    value={dados.nome_fantasia}
                    onChange={(e) => setDados({ ...dados, nome_fantasia: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={dados.cnpj}
                    onChange={(e) => setDados({ ...dados, cnpj: formatarCNPJ(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    placeholder="00.000.000/0001-00"
                    maxLength={18}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inscrição Estadual
                  </label>
                  <input
                    type="text"
                    value={dados.inscricao_estadual}
                    onChange={(e) => setDados({ ...dados, inscricao_estadual: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    placeholder="ISENTO"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logradouro *
                  </label>
                  <input
                    type="text"
                    value={dados.endereco}
                    onChange={(e) => setDados({ ...dados, endereco: e.target.value })}
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
                    value={dados.numero}
                    onChange={(e) => setDados({ ...dados, numero: e.target.value })}
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
                    value={dados.complemento}
                    onChange={(e) => setDados({ ...dados, complemento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={dados.bairro}
                    onChange={(e) => setDados({ ...dados, bairro: e.target.value })}
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
                    value={dados.cep}
                    onChange={(e) => setDados({ ...dados, cep: formatarCEP(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    placeholder="99999-999"
                    maxLength={9}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={dados.cidade}
                    onChange={(e) => setDados({ ...dados, cidade: e.target.value })}
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
                    value={dados.estado}
                    onChange={(e) => setDados({ ...dados, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    placeholder="RS"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    value={dados.telefone}
                    onChange={(e) => setDados({ ...dados, telefone: formatarTelefone(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    placeholder="(55) 99999-9999"
                    maxLength={15}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={dados.email}
                    onChange={(e) => setDados({ ...dados, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site
                  </label>
                  <input
                    type="url"
                    value={dados.site}
                    onChange={(e) => setDados({ ...dados, site: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    placeholder="https://www.seusite.com.br"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={dados.observacoes}
                onChange={(e) => setDados({ ...dados, observacoes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                rows={3}
                placeholder="Informações adicionais sobre a empresa..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={salvando}
                className="flex items-center gap-2 px-6 py-3 bg-primary-blue-500 text-white rounded-lg hover:bg-primary-blue-600 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {salvando ? 'Salvando...' : 'Salvar Dados'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
