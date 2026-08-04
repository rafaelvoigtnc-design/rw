'use client';

import { useState, useEffect } from 'react';

interface CarrinhoItem {
  id: string;
  brinquedo_id: string;
  data_interesse: string | null;
  horario_inicio: string | null;
  horario_fim: string | null;
  brinquedo: {
    id: string;
    nome: string;
    fotos: string[];
  };
}

interface CarrinhoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CarrinhoModal({ isOpen, onClose }: CarrinhoModalProps) {
  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataInteresse, setDataInteresse] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCarrinho();
    }
  }, [isOpen]);

  const fetchCarrinho = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/carrinho');
      if (response.ok) {
        const data = await response.json();
        setItens(data);
      }
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  const removerItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/carrinho/${itemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchCarrinho();
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const finalizarCarrinho = () => {
    if (itens.length === 0) return;

    let mensagem = `Olá! Gostaria de fazer uma locação com os seguintes brinquedos:\n\n`;
    
    itens.forEach((item, index) => {
      mensagem += `${index + 1}. ${item.brinquedo.nome}`;
      if (item.data_interesse) {
        mensagem += `\n   Data: ${new Date(item.data_interesse).toLocaleDateString('pt-BR')}`;
      }
      if (item.horario_inicio && item.horario_fim) {
        mensagem += `\n   Horário: ${item.horario_inicio} às ${item.horario_fim}`;
      }
      mensagem += '\n';
    });
    
    if (dataInteresse) {
      mensagem += `\nData de interesse geral: ${dataInteresse}`;
    }
    
    mensagem += '\n\nAguardo retorno!';

    const mensagemCodificada = encodeURIComponent(mensagem);
    window.open(`https://wa.me/5555997302463?text=${mensagemCodificada}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Meu Carrinho</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ) : itens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Seu carrinho está vazio.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {itens.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      {item.brinquedo.fotos && item.brinquedo.fotos.length > 0 ? (
                        <img
                          src={item.brinquedo.fotos[0]}
                          alt={item.brinquedo.nome}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">Sem foto</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.brinquedo.nome}</h3>
                      {item.data_interesse && (
                        <p className="text-sm text-gray-500">
                          Data: {new Date(item.data_interesse).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {item.horario_inicio && item.horario_fim && (
                        <p className="text-sm text-gray-500">
                          Horário: {item.horario_inicio} às {item.horario_fim}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removerItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Interesse (opcional)
                </label>
                <input
                  type="date"
                  value={dataInteresse}
                  onChange={(e) => setDataInteresse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={finalizarCarrinho}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Finalizar e Enviar para WhatsApp
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
