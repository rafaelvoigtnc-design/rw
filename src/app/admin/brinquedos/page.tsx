'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Brinquedo {
  id: string;
  nome: string;
  descricao: string;
  fotos: string[];
  tema_layout: string;
  dimensoes: string;
  faixa_etaria: string;
  status: string;
}

const TEMAS = [
  { value: 'infantil_ludico', label: 'Infantil Lúdico' },
  { value: 'aventura_acao', label: 'Aventura/Ação' },
  { value: 'esporte_competicao', label: 'Esporte/Competição' },
  { value: 'agua_diversao', label: 'Água/Diversão' },
  { value: 'festa_elegante', label: 'Festa Elegante' },
  { value: 'classico_divertido', label: 'Clássico Divertido' },
];

export default function AdminBrinquedos() {
  const router = useRouter();
  const [brinquedos, setBrinquedos] = useState<Brinquedo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<Brinquedo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    fotos: [] as string[],
    tema_layout: 'classico_divertido',
    dimensoes: '',
    faixa_etaria: '',
    status: 'DISPONIVEL',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/brinquedos');
      const data = await response.json();

      // Converter fotos de JSON string para array
      const brinquedosComFotos = data.map((b: any) => ({
        ...b,
        fotos: typeof b.fotos === 'string' ? JSON.parse(b.fotos) : (b.fotos || []),
      }));

      setBrinquedos(brinquedosComFotos);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const novasFotos = [...formData.fotos];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao fazer upload');
        }

        const data = await response.json();
        novasFotos.push(data.url);
      }

      setFormData({ ...formData, fotos: novasFotos });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload das imagens');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dadosParaEnviar = {
      nome: formData.nome,
      descricao: formData.descricao,
      fotos: formData.fotos,
      tema_layout: formData.tema_layout,
      dimensoes: formData.dimensoes,
      faixa_etaria: formData.faixa_etaria,
      status: formData.status,
    };

    try {
      let response;
      
      if (editando) {
        // Atualizar brinquedo existente
        response = await fetch(`/api/admin/brinquedos/${editando.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dadosParaEnviar),
        });
      } else {
        // Criar novo brinquedo
        response = await fetch('/api/admin/brinquedos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dadosParaEnviar),
        });
      }

      const result = await response.json();

      if (response.ok) {
        alert(editando ? 'Brinquedo atualizado com sucesso!' : 'Brinquedo criado com sucesso!');
        setMostrarFormulario(false);
        setEditando(null);
        setFormData({
          nome: '',
          descricao: '',
          fotos: [],
          tema_layout: 'classico_divertido',
          dimensoes: '',
          faixa_etaria: '',
          status: 'DISPONIVEL',
        });
        fetchData();
      } else {
        alert(`Erro: ${result.error || 'Erro ao salvar brinquedo'}`);
        console.error('Erro completo:', result);
      }
    } catch (error) {
      console.error('Erro ao salvar brinquedo:', error);
      alert('Erro ao salvar brinquedo');
    }
  };

  const handleEdit = (brinquedo: Brinquedo) => {
    console.log('Editando brinquedo:', brinquedo);
    console.log('Tema atual:', brinquedo.tema_layout);
    setEditando(brinquedo);
    setFormData({
      nome: brinquedo.nome,
      descricao: brinquedo.descricao,
      fotos: Array.isArray(brinquedo.fotos) ? brinquedo.fotos : [],
      tema_layout: brinquedo.tema_layout || 'classico_divertido',
      dimensoes: brinquedo.dimensoes,
      faixa_etaria: brinquedo.faixa_etaria,
      status: brinquedo.status,
    });
    setMostrarFormulario(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este brinquedo?')) return;

    try {
      const response = await fetch(`/api/admin/brinquedos/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao deletar brinquedo:', error);
    }
  };

  const removerFoto = (index: number) => {
    setFormData({
      ...formData,
      fotos: formData.fotos.filter((_, i) => i !== index),
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
            <h1 className="text-xl font-bold text-gray-900">Gestão de Brinquedos</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                nome: '',
                descricao: '',
                fotos: [],
                tema_layout: 'classico_divertido',
                dimensoes: '',
                faixa_etaria: '',
                status: 'DISPONIVEL',
              });
              setMostrarFormulario(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
          >
            + Novo Brinquedo
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editando ? 'Editar Brinquedo' : 'Novo Brinquedo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
                {uploading && <p className="text-sm text-gray-500 mt-1">Fazendo upload...</p>}
              </div>

              {formData.fotos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {formData.fotos.map((foto, index) => (
                    <div key={index} className="relative">
                      <img
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removerFoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tema do Layout</label>
                <select
                  value={formData.tema_layout}
                  onChange={(e) => setFormData({ ...formData, tema_layout: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  {TEMAS.map((tema) => (
                    <option key={tema.value} value={tema.value}>
                      {tema.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dimensões</label>
                <input
                  type="text"
                  value={formData.dimensoes}
                  onChange={(e) => setFormData({ ...formData, dimensoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  placeholder="Ex: 3m x 3m x 2m"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faixa Etária</label>
                <input
                  type="text"
                  value={formData.faixa_etaria}
                  onChange={(e) => setFormData({ ...formData, faixa_etaria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  placeholder="Ex: 3-12 anos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="MANUTENCAO">Manutenção</option>
                  <option value="APOSENTADO">Aposentado</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                >
                  {editando ? 'Atualizar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {brinquedos.map((brinquedo) => (
                <tr key={brinquedo.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {brinquedo.fotos && brinquedo.fotos.length > 0 && (
                        <img
                          src={brinquedo.fotos[0]}
                          alt={brinquedo.nome}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">{brinquedo.nome}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      brinquedo.status === 'DISPONIVEL' ? 'bg-green-100 text-green-800' :
                      brinquedo.status === 'MANUTENCAO' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {brinquedo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(brinquedo)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(brinquedo.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
