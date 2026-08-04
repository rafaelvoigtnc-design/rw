'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Download, FileText, Building2, User, Calendar, MapPin, DollarSign, Check } from 'lucide-react';

interface Contrato {
  id: string;
  locacao_id: string;
  cliente_nome: string;
  cliente_cpf: string;
  cliente_rg: string;
  cliente_nascimento: string;
  cliente_endereco: string;
  cliente_numero: string;
  cliente_complemento: string;
  cliente_bairro: string;
  cliente_cidade: string;
  cliente_estado: string;
  cliente_cep: string;
  cliente_telefone: string;
  cliente_email: string;
  data_contrato: string;
  data_evento: string;
  horario_inicio: string;
  horario_fim: string;
  local_evento: string;
  valor_total: number;
  valor_sinal: number;
  forma_pagamento: string;
  clausulas_adicionais: string;
  status: string;
  observacoes: string;
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
}

export default function VisualizarContrato({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [empresa, setEmpresa] = useState<DadosEmpresa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [contratoRes, empresaRes] = await Promise.all([
        fetch(`/api/admin/contratos/${params.id}`),
        fetch('/api/admin/dados-empresa'),
      ]);

      const contratoData = await contratoRes.json();
      const empresaData = await empresaRes.json();

      setContrato(contratoData);
      setEmpresa(empresaData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  const clausulasPadrao = [
    {
      titulo: '1. DO OBJETO',
      conteudo: `O presente contrato tem como objeto a locação de brinquedos e itens para festas, conforme descrição na locação nº ${contrato?.locacao_id}, para o evento realizado em ${contrato?.local_evento} na data ${formatarData(contrato.data_evento)}.`,
    },
    {
      titulo: '2. DO VALOR E FORMA DE PAGAMENTO',
      conteudo: `O valor total do contrato é de ${contrato ? formatarMoeda(contrato.valor_total) : ''}, a ser pago da seguinte forma: ${contrato?.forma_pagamento}. Sinal no valor de ${contrato ? formatarMoeda(contrato.valor_sinal) : ''} pago na assinatura deste contrato, e o saldo restante na entrega dos itens.`,
    },
    {
      titulo: '3. DAS OBRIGAÇÕES DO LOCATÁRIO',
      conteudo: `O LOCATÁRIO compromete-se a: a) Utilizar os brinquedos e itens de forma adequada e conforme as instruções fornecidas; b) Manter a vigilância sobre os brinquedos durante todo o período de locação; c) Não permitir que crianças brinquem sem supervisão de adulto responsável; d) Não alterar, modificar ou tentar reparar os brinquedos; e) Comunicar imediatamente qualquer dano ou defeito encontrado.`,
    },
    {
      titulo: '4. DA RESPONSABILIDADE POR DANOS',
      conteudo: `O LOCATÁRIO é integralmente responsável por qualquer dano, quebra, perda ou deterioração dos brinquedos e itens locados, ocorridos durante o período de locação. Em caso de dano por falta de cuidado, uso inadequado ou negligência, o LOCATÁRIO compromete-se a pagar o valor de reparação ou substituição do item, conforme tabela de preços da LOCADORA. Danos considerados leves terão desconto de até 30% do valor do item, enquanto danos graves ou perda total implicarão no pagamento integral do valor do item novo.`,
    },
    {
      titulo: '5. DA SEGURANÇA',
      conteudo: `A LOCADORA não se responsabiliza por acidentes ocorridos durante o uso dos brinquedos, desde que estes tenham sido instalados corretamente e de acordo com as normas de segurança. O LOCATÁRIO é responsável por garantir a segurança dos usuários durante todo o período de uso.`,
    },
    {
      titulo: '6. DO PRAZO DE LOCAÇÃO',
      conteudo: `A locação terá início às ${contrato?.horario_inicio} e término às ${contrato?.horario_fim} do dia ${contrato ? formatarData(contrato.data_evento) : ''}. Atrasos na devolução sujeitarão o LOCATÁRIO ao pagamento de multa correspondente a 50% do valor da diária por cada hora de atraso.`,
    },
    {
      titulo: '7. DA ENTREGA E DEVOLUÇÃO',
      conteudo: `A LOCADORA compromete-se a entregar os brinquedos e itens no local e horário acordados, em perfeitas condições de uso. O LOCATÁRIO compromete-se a devolver todos os itens no mesmo estado em que recebeu, salvo desgaste normal do uso.`,
    },
    {
      titulo: '8. DAS CONDIÇÕES DE CANCELAMENTO',
      conteudo: `O cancelamento da locação pelo LOCATÁRIO com antecedência mínima de 7 dias dará direito à devolução integral do valor pago. Cancelamentos com menos de 7 dias de antecedência terão retenção de 50% do valor total como multa. Cancelamentos com menos de 24 horas de antecedência não terão direito a reembolso.`,
    },
    {
      titulo: '9. DO FORO',
      conteudo: `As partes elegem o foro da comarca de ${empresa?.cidade} para dirimir quaisquer dúvidas ou controvérsias decorrentes deste contrato.`,
    },
  ];

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!contrato || !empresa) {
    return <div className="p-8">Dados não encontrados</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              onClick={() => router.push('/admin/contratos')}
              className="flex items-center gap-2 text-gray-800 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <h1 className="text-xl font-bold text-gray-900">Visualizar Contrato</h1>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue-500 text-white rounded-lg hover:bg-primary-blue-600 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-soft p-8 print:shadow-none print:rounded-none">
          {/* Cabeçalho */}
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">CONTRATO DE LOCAÇÃO</h1>
            <p className="text-gray-600">Nº {contrato.id.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* Dados das Partes */}
          <div className="mb-8 space-y-6">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-primary-blue-600 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">LOCADORA</h3>
                <p className="text-sm text-gray-700">
                  <strong>{empresa.razao_social}</strong>, inscrita no CNPJ sob o nº {empresa.cnpj}
                  {empresa.inscricao_estadual && `, inscrição estadual nº ${empresa.inscricao_estadual}`},
                  com sede à {empresa.endereco}, nº {empresa.numero}
                  {empresa.complemento && `, ${empresa.complemento}`}, bairro {empresa.bairro},
                  cidade {empresa.cidade}/{empresa.estado}, CEP {empresa.cep},
                  telefone {empresa.telefone}, email {empresa.email}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary-green-600 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">LOCATÁRIO</h3>
                <p className="text-sm text-gray-700">
                  <strong>{contrato.cliente_nome}</strong>, portador do CPF nº {contrato.cliente_cpf}
                  {contrato.cliente_rg && `, RG nº ${contrato.cliente_rg}`}
                  {contrato.cliente_nascimento && `, nascido em ${formatarData(contrato.cliente_nascimento)}`},
                  residente e domiciliado à {contrato.cliente_endereco}, nº {contrato.cliente_numero}
                  {contrato.cliente_complemento && `, ${contrato.cliente_complemento}`}, bairro {contrato.cliente_bairro},
                  cidade {contrato.cliente_cidade}/{contrato.cliente_estado}, CEP {contrato.cliente_cep},
                  telefone {contrato.cliente_telefone}
                  {contrato.cliente_email && `, email ${contrato.cliente_email}`}.
                </p>
              </div>
            </div>
          </div>

          {/* Dados do Evento */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              DADOS DO EVENTO
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Data:</span>
                <span className="ml-2 font-medium">{formatarData(contrato.data_evento)}</span>
              </div>
              <div>
                <span className="text-gray-600">Horário:</span>
                <span className="ml-2 font-medium">{contrato.horario_inicio} às {contrato.horario_fim}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Local:</span>
                <span className="ml-2 font-medium">{contrato.local_evento}</span>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="mb-8 p-4 bg-green-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              VALORES
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Valor Total:</span>
                <span className="ml-2 font-bold text-lg">{formatarMoeda(contrato.valor_total)}</span>
              </div>
              <div>
                <span className="text-gray-600">Sinal:</span>
                <span className="ml-2 font-medium">{formatarMoeda(contrato.valor_sinal)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Forma de Pagamento:</span>
                <span className="ml-2 font-medium">{contrato.forma_pagamento}</span>
              </div>
            </div>
          </div>

          {/* Cláusulas */}
          <div className="mb-8 space-y-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              CLÁUSULAS CONTRATUAIS
            </h3>

            {clausulasPadrao.map((clausula, index) => (
              <div key={index} className="border-l-4 border-primary-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">{clausula.titulo}</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{clausula.conteudo}</p>
              </div>
            ))}

            {contrato.clausulas_adicionais && (
              <div className="border-l-4 border-primary-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">CLÁUSULAS ADICIONAIS</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {contrato.clausulas_adicionais}
                </p>
              </div>
            )}
          </div>

          {/* Observações */}
          {contrato.observacoes && (
            <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">OBSERVAÇÕES</h3>
              <p className="text-sm text-gray-700">{contrato.observacoes}</p>
            </div>
          )}

          {/* Assinaturas */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-bold text-gray-900 mb-6 text-center">ASSINATURAS</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="border-b-2 border-gray-400 mb-2 h-16"></div>
                <p className="text-sm text-gray-700 font-medium">{empresa.nome_fantasia}</p>
                <p className="text-xs text-gray-500">LOCADORA</p>
                {contrato.empresa_assinou && (
                  <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" />
                    Assinado em {formatarData(contrato.data_contrato)}
                  </p>
                )}
              </div>
              <div className="text-center">
                <div className="border-b-2 border-gray-400 mb-2 h-16"></div>
                <p className="text-sm text-gray-700 font-medium">{contrato.cliente_nome}</p>
                <p className="text-xs text-gray-500">LOCATÁRIO</p>
                {contrato.cliente_assinou && (
                  <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" />
                    Assinado em {formatarData(contrato.data_contrato)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
            <p>{empresa.cidade}, {formatarData(contrato.data_contrato)}</p>
            <p className="mt-2">Este contrato é firmado em duas vias de igual teor e forma.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
