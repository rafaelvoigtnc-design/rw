'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IconPicker from '@/components/IconPicker';
import ImageEditor from '@/components/ImageEditor';

interface ConteudoPagina {
  id: string;
  pagina: string;
  chave: string;
  valor: string;
  tipo: string;
  atualizado_em: string;
}

export default function AdminConteudo() {
  const router = useRouter();
  const [conteudos, setConteudos] = useState<ConteudoPagina[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaSelecionada, setPaginaSelecionada] = useState('home');
  const [editando, setEditando] = useState<{ id: string; valor: string; tipo: string } | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState('');

  useEffect(() => {
    fetchData();
  }, [paginaSelecionada]);

  const fetchData = async () => {
    try {
      console.log(`Buscando conteúdo para página: ${paginaSelecionada}`);
      const response = await fetch(`/api/admin/conteudo?pagina=${paginaSelecionada}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Conteúdo recebido:', data);
      
      if (Array.isArray(data)) {
        console.log(`Carregando ${data.length} itens de conteúdo`);
        setConteudos(data);
      } else if (data.error) {
        console.error('Erro na API:', data.error);
        setConteudos([]);
      } else {
        console.log('Dados não é array, convertendo:', data);
        setConteudos([]);
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error);
      setConteudos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (id: string, valor: string) => {
    try {
      const conteudo = conteudos.find(c => c.id === id);
      if (!conteudo) return;

      const response = await fetch('/api/admin/conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagina: conteudo.pagina,
          chave: conteudo.chave,
          valor,
          tipo: conteudo.tipo,
        }),
      });

      if (response.ok) {
        setEditando(null);
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
    }
  };

  const paginas = [
    { value: 'home', label: 'Home' },
    { value: 'sobre', label: 'Sobre' },
    { value: 'catalogo', label: 'Catálogo' },
    { value: 'contato', label: 'Contato' },
    { value: 'promocoes', label: 'Promoções' },
    { value: 'depoimentos', label: 'Depoimentos' },
  ];

  const adicionarConteudo = async () => {
    const novaChave = prompt('Digite a chave do novo conteúdo (ex: foto_equipe):');
    if (!novaChave) return;

    const novoTipo = prompt('Digite o tipo (texto ou imagem):', 'texto');
    if (!novoTipo) return;

    try {
      const response = await fetch('/api/admin/conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagina: paginaSelecionada,
          chave: novaChave,
          valor: '',
          tipo: novoTipo,
        }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao adicionar conteúdo:', error);
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
            <h1 className="text-xl font-bold text-gray-900">CMS de Conteúdo</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a Página
          </label>
          <select
            value={paginaSelecionada}
            onChange={(e) => setPaginaSelecionada(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-gray-900"
          >
            {paginas.map((pagina) => (
              <option key={pagina.value} value={pagina.value}>
                {pagina.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold capitalize">
              Editar Conteúdo - {paginaSelecionada}
            </h2>
            <button
              onClick={adicionarConteudo}
              className="px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors"
            >
              + Adicionar Conteúdo
            </button>
          </div>

          {conteudos.length === 0 ? (
            <p className="text-gray-500">Nenhum conteúdo configurado para esta página.</p>
          ) : (
            <div className="space-y-6">
              {conteudos.map((conteudo) => (
                <div key={conteudo.id} className="border-b pb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {conteudo.chave.replace(/_/g, ' ').toUpperCase()}
                  </label>
                  
                  {editando?.id === conteudo.id ? (
                    <div className="space-y-2">
                      {conteudo.tipo === 'texto' ? (
                        <textarea
                          value={editando.valor}
                          onChange={(e) => setEditando({ id: conteudo.id, valor: e.target.value, tipo: conteudo.tipo })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          rows={3}
                        />
                      ) : conteudo.tipo === 'imagem' ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editando.valor}
                            onChange={(e) => setEditando({ id: conteudo.id, valor: e.target.value, tipo: conteudo.tipo })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                            placeholder="URL da imagem"
                          />
                          {editando.valor && (
                            <button
                              onClick={() => {
                                setEditingImage(editando.valor);
                                setShowImageEditor(true);
                              }}
                              className="text-sm text-primary-blue-600 hover:text-primary-blue-700"
                            >
                              Editar imagem
                            </button>
                          )}
                        </div>
                      ) : conteudo.tipo === 'icone' ? (
                        <IconPicker
                          onSelect={(iconName) => setEditando({ id: conteudo.id, valor: iconName, tipo: conteudo.tipo })}
                          selectedIcon={editando.valor}
                        />
                      ) : (
                        <input
                          type="text"
                          value={editando.valor}
                          onChange={(e) => setEditando({ id: conteudo.id, valor: e.target.value, tipo: conteudo.tipo })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        />
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSalvar(conteudo.id, editando.valor)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditando(null)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {conteudo.tipo === 'texto' ? (
                        <p className="text-gray-700 whitespace-pre-wrap">{conteudo.valor}</p>
                      ) : conteudo.tipo === 'imagem' ? (
                        <div className="flex items-center gap-2">
                          {conteudo.valor ? (
                            <img
                              src={conteudo.valor}
                              alt={conteudo.chave}
                              className="w-32 h-32 object-cover rounded"
                            />
                          ) : (
                            <span className="text-gray-400">Sem imagem</span>
                          )}
                          <p className="text-gray-700 text-sm">{conteudo.valor}</p>
                        </div>
                      ) : conteudo.tipo === 'icone' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">{conteudo.valor}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Ícone</span>
                        </div>
                      ) : (
                        <p className="text-gray-700">{conteudo.valor}</p>
                      )}
                      <button
                        onClick={() => setEditando({ id: conteudo.id, valor: conteudo.valor, tipo: conteudo.tipo })}
                        className="text-emerald-600 hover:text-emerald-800 text-sm"
                      >
                        Editar
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-1">
                    Última atualização: {new Date(conteudo.atualizado_em).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Adicionar Novo Conteúdo</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const chave = formData.get('chave') as string;
              const valor = formData.get('valor') as string;
              const tipo = formData.get('tipo') as string;

              try {
                const response = await fetch('/api/admin/conteudo', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    pagina: paginaSelecionada,
                    chave,
                    valor,
                    tipo,
                  }),
                });

                if (response.ok) {
                  (e.target as HTMLFormElement).reset();
                  fetchData();
                }
              } catch (error) {
                console.error('Erro ao adicionar conteúdo:', error);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chave</label>
                <input
                  type="text"
                  name="chave"
                  placeholder="ex: titulo_hero"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  name="tipo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="texto">Texto</option>
                  <option value="imagem">Imagem (URL)</option>
                  <option value="icone">Ícone (lucide-react)</option>
                  <option value="numero">Número</option>
                  <option value="cor">Cor (classe Tailwind)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                type="text"
                name="valor"
                placeholder="Conteúdo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
            >
              Adicionar
            </button>
          </form>
        </div>

        {showImageEditor && (
          <ImageEditor
            imageUrl={editingImage}
            onSave={(croppedImageUrl) => {
              if (editando) {
                setEditando({ ...editando, valor: croppedImageUrl });
              }
              setShowImageEditor(false);
            }}
            onCancel={() => setShowImageEditor(false)}
          />
        )}
      </div>
    </div>
  );
}
