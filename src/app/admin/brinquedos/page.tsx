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
  preco_periodo: number;
  status: string;
  categoria_id: string;
  categoria?: {
    nome: string;
  };
}

interface Categoria {
  id: string;
  nome: string;
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
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState<Brinquedo | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    fotos: [] as string[],
    tema_layout: 'classico_divertido',
    dimensoes: '',
    faixa_etaria: '',
    preco_periodo: 0,
    status: 'DISPONIVEL',
    categoria_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [brinqRes, catRes] = await Promise.all([
        fetch('/api/admin/brinquedos'),
        fetch('/api/categorias'),
      ]);
      const brinqData = await brinqRes.json();
      const catData = await catRes.json();
      setBrinquedos(brinqData);
      setCategorias(catData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editando ? `/api/admin/brinquedos/${editando.id}` : '/api/admin/brinquedos';
      const method = editando ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMostrarFormulario(false);
        setEditando(null);
        setFormData({
          nome: '',
          descricao: '',
          fotos: [],
          tema_layout: 'classico_divertido',
          dimensoes: '',
          faixa_etaria: '',
          preco_periodo: 0,
          status: 'DISPONIVEL',
          categoria_id: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Erro ao salvar brinquedo:', error);
    }
  };

  const handleEdit = (brinquedo: Brinquedo) => {
    setEditando(brinquedo);
    setFormData({
      nome: brinquedo.nome,
      descricao: brinquedo.descricao,
      fotos: brinquedo.fotos,
      tema_layout: brinquedo.tema_layout,
      dimensoes: brinquedo.dimensoes,
      faixa_etaria: brinquedo.faixa_etaria,
      preco_periodo: brinquedo.preco_periodo,
      status: brinquedo.status,
      categoria_id: brinquedo.categoria_id,
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

  const adicionarFoto = () => {
    const url = prompt('Digite a URL da foto:');
    if (url) {
      setFormData({ ...formData, fotos: [...formData.fotos, url] });
    }
  };

  const removerFoto = (index: number) => {
    setFormData({
      ...formData,
      fotos: formData.fotos.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, fotos: [...formData.fotos, data.url] });
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload');
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
                preco_periodo: 0,
                status: 'DISPONIVEL',
                categoria_id: '',
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
                <div className="space-y-2">
                  {formData.fotos.map((foto, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {foto && (
                        <img 
                          src={foto} 
                          alt={`Foto ${index + 1}`} 
                          className="w-16 h-16 object-cover rounded-md border border-gray-300"
                        />
                      )}
                      <input
                        type="text"
                        value={foto}
                        onChange={(e) => {
                          const novasFotos = [...formData.fotos];
                          novasFotos[index] = e.target.value;
                          setFormData({ ...formData, fotos: novasFotos });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        placeholder="URL da foto"
                      />
                      <button
                        type="button"
                        onClick={() => removerFoto(index)}
                        className="text-red-600 hover:text-red-800 px-2 py-1"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={adicionarFoto}
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      + Adicionar URL
                    </button>
                    <label className="text-blue-600 hover:text-blue-800 cursor-pointer">
                      + Fazer Upload
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tema Visual</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dimensões</label>
                  <input
                    type="text"
                    value={formData.dimensoes}
                    onChange={(e) => setFormData({ ...formData, dimensoes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faixa Etária</label>
                  <input
                    type="text"
                    value={formData.faixa_etaria}
                    onChange={(e) => setFormData({ ...formData, faixa_etaria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço por Período (uso interno)</label>
                  <input
                    type="number"
                    value={formData.preco_periodo}
                    onChange={(e) => setFormData({ ...formData, preco_periodo: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
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
                    <option value="INDISPONIVEL">Indisponível</option>
                    <option value="MANUTENCAO">Em Manutenção</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={formData.categoria_id}
                  onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
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
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tema
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
                    <div className="text-sm font-medium text-gray-900">{brinquedo.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{brinquedo.categoria?.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {TEMAS.find((t) => t.value === brinquedo.tema_layout)?.label || brinquedo.tema_layout}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      brinquedo.status === 'DISPONIVEL' ? 'bg-green-100 text-green-800' :
                      brinquedo.status === 'INDISPONIVEL' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {brinquedo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(brinquedo)}
                      className="text-emerald-600 hover:text-emerald-900 mr-4"
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
