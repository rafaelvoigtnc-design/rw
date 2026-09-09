'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
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
  const [uploadFile, setUploadFile] = useState<File | null>(null);

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
      console.log('=== INICIANDO SALVAMENTO ===');
      // Se o ID for igual a uma chave (campo não salvo ainda), precisamos criar novo
      const conteudoExistente = conteudos.find(c => c.id === id);
      const campoDefinido = camposPorPagina[paginaSelecionada]?.find(c => c.chave === id);

      let finalValor = valor;

      // Se houver arquivo, fazer upload direto para Firebase Storage (client-side)
      if (uploadFile && (conteudoExistente?.tipo === 'imagem' || campoDefinido?.tipo === 'imagem')) {
        console.log('Fazendo upload para Firebase Storage (client-side)...');
        console.log('Tamanho do arquivo:', uploadFile.size);
        console.log('Nome do arquivo:', uploadFile.name);

        const timestamp = Date.now();
        const extensao = uploadFile.name.split('.').pop();
        const chaveFinal = campoDefinido?.chave || conteudoExistente?.chave;
        const fileName = `${chaveFinal}_${timestamp}.${extensao}`;
        const storagePath = `conteudo/${paginaSelecionada}/${fileName}`;

        console.log('Storage path:', storagePath);

        try {
          // Upload direto para Firebase Storage
          const storageRef = ref(storage, storagePath);
          console.log('Storage ref criado');

          const bytes = await uploadFile.arrayBuffer();
          console.log('Bytes lidos:', bytes.byteLength);

          const buffer = Buffer.from(bytes);
          console.log('Buffer criado');

          console.log('Iniciando uploadBytes...');
          await uploadBytes(storageRef, buffer);
          console.log('Upload concluído com sucesso');

          // Obter URL
          console.log('Obtendo URL de download...');
          finalValor = await getDownloadURL(storageRef);
          console.log('URL obtida:', finalValor);
        } catch (uploadError) {
          console.error('Erro no upload:', uploadError);
          console.error('Detalhes:', uploadError instanceof Error ? uploadError.message : String(uploadError));
          alert('Erro ao fazer upload da imagem: ' + (uploadError instanceof Error ? uploadError.message : String(uploadError)));
          return;
        }
      }

      console.log('Enviando dados para API...');

      // Enviar apenas os dados (sem arquivo) para a API
      const response = await fetch('/api/admin/conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagina: paginaSelecionada,
          chave: campoDefinido?.chave || conteudoExistente?.chave,
          valor: finalValor,
          tipo: campoDefinido?.tipo || conteudoExistente?.tipo,
        }),
      });

      console.log('Status da resposta:', response.status);

      const responseData = await response.json();
      console.log('Resposta da API:', responseData);

      if (response.ok) {
        setEditando(null);
        setUploadFile(null);
        fetchData();
        alert('Conteúdo salvo com sucesso!');
      } else {
        alert('Erro ao salvar: ' + (responseData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
      alert('Erro ao salvar conteúdo: ' + (error instanceof Error ? error.message : String(error)));
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

  const camposPorPagina: Record<string, Array<{ chave: string; label: string; tipo: string; tamanho?: string }>> = {
    home: [
      { chave: 'foto_equipe', label: 'Foto da Equipe', tipo: 'imagem', tamanho: '1920x1080 (landscape)' },
      { chave: 'titulo_hero', label: 'Título do Hero', tipo: 'texto' },
      { chave: 'subtitulo_hero', label: 'Subtítulo do Hero', tipo: 'texto' },
    ],
    sobre: [
      { chave: 'foto_equipe', label: 'Foto da Equipe', tipo: 'imagem', tamanho: '1920x1080 (landscape)' },
      { chave: 'texto_historia', label: 'Texto de Nossa História', tipo: 'texto' },
      { chave: 'texto_missao', label: 'Texto de Nossa Missão', tipo: 'texto' },
      { chave: 'texto_visao', label: 'Texto de Nossa Visão', tipo: 'texto' },
    ],
    catalogo: [
      { chave: 'titulo_catalogo', label: 'Título do Catálogo', tipo: 'texto' },
      { chave: 'subtitulo_catalogo', label: 'Subtítulo do Catálogo', tipo: 'texto' },
    ],
    contato: [
      { chave: 'telefone', label: 'Telefone de Contato', tipo: 'texto' },
      { chave: 'email', label: 'Email de Contato', tipo: 'texto' },
      { chave: 'whatsapp', label: 'WhatsApp', tipo: 'texto' },
    ],
    promocoes: [
      { chave: 'banner_promocoes', label: 'Banner de Promoções', tipo: 'imagem', tamanho: '1920x600 (banner)' },
      { chave: 'titulo_promocoes', label: 'Título de Promoções', tipo: 'texto' },
    ],
    depoimentos: [
      { chave: 'titulo_depoimentos', label: 'Título de Depoimentos', tipo: 'texto' },
      { chave: 'subtitulo_depoimentos', label: 'Subtítulo de Depoimentos', tipo: 'texto' },
    ],
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
          <h2 className="text-xl font-semibold capitalize mb-4">
            Editar Conteúdo - {paginaSelecionada}
          </h2>

          {camposPorPagina[paginaSelecionada]?.length === 0 ? (
            <p className="text-gray-500">Nenhum campo configurado para esta página.</p>
          ) : (
            <div className="space-y-6">
              {camposPorPagina[paginaSelecionada].map((campo) => {
                const conteudoExistente = conteudos.find(c => c.chave === campo.chave);
                return (
                  <div key={campo.chave} className="border-b pb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {campo.label}
                      {campo.tamanho && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Tamanho recomendado: {campo.tamanho})
                        </span>
                      )}
                    </label>

                    {editando?.id === (conteudoExistente?.id || campo.chave) ? (
                      <div className="space-y-2">
                        {campo.tipo === 'texto' ? (
                          <textarea
                            value={editando?.valor || ''}
                            onChange={(e) => {
                              if (editando) {
                                setEditando({ id: editando.id, valor: e.target.value, tipo: campo.tipo });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                            rows={3}
                          />
                        ) : campo.tipo === 'imagem' ? (
                          <div className="space-y-2">
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Carregar imagem do PC
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file && editando) {
                                    setUploadFile(file);
                                    // Mostrar preview
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      setEditando({ id: editando.id, valor: e.target?.result as string, tipo: campo.tipo });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                              />
                            </div>
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ou colar URL da imagem
                              </label>
                              <input
                                type="text"
                                value={editando?.valor || ''}
                                onChange={(e) => {
                                  if (editando) {
                                    setEditando({ id: editando.id, valor: e.target.value, tipo: campo.tipo });
                                    setUploadFile(null);
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                                placeholder="https://exemplo.com/imagem.jpg"
                              />
                            </div>
                            {editando?.valor && (
                              <div className="mb-2">
                                <img
                                  src={editando.valor}
                                  alt="Preview"
                                  className="w-32 h-32 object-cover rounded"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={editando?.valor || ''}
                            onChange={(e) => {
                              if (editando) {
                                setEditando({ id: editando.id, valor: e.target.value, tipo: campo.tipo });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          />
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (editando) {
                                handleSalvar(editando.id, editando.valor);
                              }
                            }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => {
                              setEditando(null);
                            }}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {campo.tipo === 'texto' ? (
                          <p className="text-gray-700 whitespace-pre-wrap">{conteudoExistente?.valor || 'Não configurado'}</p>
                        ) : campo.tipo === 'imagem' ? (
                          <div className="flex items-center gap-2">
                            {conteudoExistente?.valor ? (
                              <img
                                src={conteudoExistente.valor}
                                alt={campo.label}
                                className="w-32 h-32 object-cover rounded"
                              />
                            ) : (
                              <span className="text-gray-400">Sem imagem</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-700">{conteudoExistente?.valor || 'Não configurado'}</p>
                        )}
                        <button
                          onClick={() => {
                            setEditando({
                              id: conteudoExistente?.id || campo.chave,
                              valor: conteudoExistente?.valor || '',
                              tipo: campo.tipo
                            });
                          }}
                          className="text-emerald-600 hover:text-emerald-800 text-sm"
                        >
                          Editar
                        </button>
                      </div>
                    )}

                    {conteudoExistente && (
                      <p className="text-xs text-gray-400 mt-1">
                        Última atualização: {new Date(conteudoExistente.atualizado_em).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
