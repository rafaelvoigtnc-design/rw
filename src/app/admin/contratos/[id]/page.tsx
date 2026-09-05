'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';

interface Contrato {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  cliente_endereco: string;
  cliente_numero: string;
  cliente_complemento: string;
  cliente_bairro: string;
  cliente_cidade: string;
  cliente_estado: string;
  cliente_cep: string;
  cliente_telefone: string;
  data_evento: string;
  horario_inicio: string;
  horario_fim: string;
  endereco: string;
  local_evento: string;
  valor_total: number;
  clausulas_adicionais: string;
  status: string;
  data_contrato: string;
}

interface DadosEmpresa {
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
}

export default function ContratoVisualizacao({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [dadosEmpresa, setDadosEmpresa] = useState<DadosEmpresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;

        // Buscar contrato
        const contratoResponse = await fetch(`/api/admin/contratos?id=${id}`);
        if (contratoResponse.ok) {
          const contratoData = await contratoResponse.json();
          setContrato(contratoData);
        } else {
          setError('Erro ao carregar contrato');
        }

        // Buscar dados da empresa
        const empresaResponse = await fetch('/api/dados-empresa');
        if (empresaResponse.ok) {
          const empresaData = await empresaResponse.json();
          setDadosEmpresa(empresaData);
        }
      } catch (err) {
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Carregando contrato...</div>
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">{error || 'Contrato não encontrado'}</div>
      </div>
    );
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contrato */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow-lg p-6 md:p-8 print:shadow-none print:p-6 text-sm">
          {/* Cabeçalho */}
          <div className="text-center mb-6 border-b pb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              CONTRATO DE LOCAÇÃO DE BRINQUEDOS
            </h1>
            <p className="text-gray-600 text-sm">Para Festas e Eventos Infantis</p>
          </div>

          {/* Dados das Partes */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">DAS PARTES</h2>

            <div className="mb-3">
              <h3 className="font-medium text-gray-900 mb-1">LOCADOR:</h3>
              <p className="text-gray-700">
                <strong>{dadosEmpresa?.nome_fantasia || 'RW BRINQUEDOS'}</strong>, empresa de locação de brinquedos para festas e eventos infantis,
                inscrita no CNPJ sob o nº {dadosEmpresa?.cnpj || '[CNPJ]'}{dadosEmpresa?.inscricao_estadual && `, inscrição estadual nº ${dadosEmpresa.inscricao_estadual}`},
                com sede em {dadosEmpresa?.endereco || '[Endereço]'}, nº {dadosEmpresa?.numero || '[Número]'}
                {dadosEmpresa?.complemento && `, ${dadosEmpresa.complemento}`}
                , bairro {dadosEmpresa?.bairro || '[Bairro]'}, cidade {dadosEmpresa?.cidade || '[Cidade]'} - {dadosEmpresa?.estado || '[Estado]'},
                CEP {dadosEmpresa?.cep || '[CEP]'}, telefone {dadosEmpresa?.telefone || '[Telefone]'}
                {dadosEmpresa?.email && `, email ${dadosEmpresa.email}`}
                {dadosEmpresa?.site && `, site ${dadosEmpresa.site}`}.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">LOCATÁRIO:</h3>
              <p className="text-gray-700">
                <strong>{contrato.cliente_nome}</strong>, portador do CPF nº {contrato.cliente_cpf},
                residente em {contrato.cliente_endereco}, nº {contrato.cliente_numero}
                {contrato.cliente_complemento && `, ${contrato.cliente_complemento}`}
                , bairro {contrato.cliente_bairro}, cidade {contrato.cliente_cidade} - {contrato.cliente_estado},
                CEP {contrato.cliente_cep}, telefone {contrato.cliente_telefone}.
              </p>
            </div>
          </div>

          {/* Objeto do Contrato */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">DO OBJETO</h2>
            <p className="text-gray-700 mb-3">
              O presente contrato tem como objeto a locação de brinquedos para festa infantil, conforme especificado abaixo,
              mediante as condições aqui estabelecidas.
            </p>
          </div>

          {/* Dados do Evento */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">DADOS DO EVENTO</h2>
            <div className="space-y-1 text-gray-700">
              <p><strong>Data do Evento:</strong> {formatarData(contrato.data_evento)}</p>
              <p><strong>Horário:</strong> das {contrato.horario_inicio} às {contrato.horario_fim}</p>
              <p><strong>Endereço:</strong> {contrato.endereco || 'Não informado'}</p>
              {contrato.local_evento && (
                <p><strong>Local do Evento:</strong> {contrato.local_evento}</p>
              )}
            </div>
          </div>

          {/* Valor e Condições de Pagamento */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">DO VALOR E CONDIÇÕES DE PAGAMENTO</h2>
            <div className="text-gray-700">
              <p className="mb-2">
                <strong>Valor Total da Locação:</strong> {formatarMoeda(contrato.valor_total)}
              </p>
              <p>
                O valor deverá ser pago conforme acordado entre as partes, sendo 50% (cinquenta por cento)
                no ato da assinatura deste contrato como sinal, e os 50% (cinquenta por cento) restantes
                na entrega dos brinquedos.
              </p>
            </div>
          </div>

          {/* Obrigações e Responsabilidades */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">DAS OBRIGAÇÕES E RESPONSABILIDADES</h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex gap-2">
                <span className="font-bold">1.</span>
                <p>O LOCATÁRIO compromete-se a utilizar os brinquedos de forma adequada e responsável, seguindo todas as instruções de segurança fornecidas pelo LOCADOR.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">2.</span>
                <p>O LOCATÁRIO é inteiramente responsável por qualquer dano, quebra, perda ou deterioração dos brinquedos ocorridos durante o período de locação, exceto quando decorrente de defeito de fabricação ou má conservação prévia pelo LOCADOR.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">3.</span>
                <p>Em caso de dano por mau uso, negligência ou imprudência do LOCATÁRIO, este compromete-se a pagar o valor integral do reparo ou substituição do brinquedo danificado, conforme orçamento apresentado pelo LOCADOR.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">4.</span>
                <p>O LOCATÁRIO não deve permitir que crianças utilizem os brinquedos sem supervisão adequada de um adulto responsável.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">5.</span>
                <p>É proibido o uso de objetos pontiagudos, alimentos, bebidas ou qualquer substância que possa causar danos aos brinquedos.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">6.</span>
                <p>O LOCATÁRIO deverá garantir que o local do evento seja adequado e seguro para a instalação dos brinquedos, com espaço suficiente e terreno plano.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">7.</span>
                <p>O LOCADOR se compromete a entregar os brinquedos em perfeito estado de conservação, limpeza e funcionamento, e a realizar a montagem e desmontagem quando contratado.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">8.</span>
                <p>O atraso na devolução dos brinquedos além do horário estipulado acarretará multa de 10% (dez por cento) do valor total da locação por hora de atraso, limitado ao valor de uma diária completa.</p>
              </div>
            </div>
          </div>

          {/* Cláusulas Adicionais */}
          {contrato.clausulas_adicionais && (
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">CLÁUSULAS ADICIONAIS</h2>
              <div>
                <p className="text-gray-700 whitespace-pre-line">{contrato.clausulas_adicionais}</p>
              </div>
            </div>
          )}

          {/* Foro */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">DO FORO</h2>
            <p className="text-gray-700">
              As partes elegem o foro da comarca de {contrato.cliente_cidade} para dirimir quaisquer dúvidas ou controvérsias decorrentes deste contrato.
            </p>
          </div>

          {/* Assinaturas */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-base font-semibold text-gray-900 mb-6">ASSINATURAS</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
                <p className="font-medium text-gray-900">LOCADOR</p>
                <p className="text-xs text-gray-600">RW Brinquedos</p>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
                <p className="font-medium text-gray-900">LOCATÁRIO</p>
                <p className="text-xs text-gray-600">{contrato.cliente_nome}</p>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-gray-600">
              <p>{contrato.cliente_cidade}, {formatarData(contrato.data_contrato)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
