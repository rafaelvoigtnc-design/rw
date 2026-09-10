'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Brinquedo {
  id: string;
  nome: string;
  descricao: string;
  fotos: string[];
  dimensoes: string;
  faixa_etaria: string;
  status: string;
  destaque_home: boolean;
}

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
    dimensoes: '',
    faixa_etaria: '',
    status: 'DISPONIVEL',
    destaque_home: false,
  });

  // Calcular tamanho total das fotos em base64
  const calcularTamanhoTotalFotos = () => {
    return formData.fotos.reduce((total, foto) => total + foto.length, 0);
  };

  const tamanhoTotalFotos = calcularTamanhoTotalFotos();
  const limiteFirestore = 1000000; // 1MB em caracteres
  const tamanhoRestante = limiteFirestore - tamanhoTotalFotos;
  const porcentagemUsada = (tamanhoTotalFotos / limiteFirestore) * 100;

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

    console.log('🔍 Iniciando upload de imagens...');
    console.log('📦 Quantidade de arquivos:', files.length);

    // Limite de 10 imagens por brinquedo
    const MAX_FOTOS = 10;
    if (formData.fotos.length + files.length > MAX_FOTOS) {
      alert(`Você pode ter no máximo ${MAX_FOTOS} fotos por brinquedo. Atualmente tem ${formData.fotos.length} fotos.`);
      return;
    }

    setUploading(true);
    const novasFotos = [...formData.fotos];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📄 Processando arquivo ${i + 1}/${files.length}:`, file.name);
        console.log('   Tamanho:', file.size, 'bytes');
        console.log('   Tipo:', file.type);

        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        console.log('⬆️ Enviando para API...');
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        console.log('📡 Status da resposta:', response.status);

        if (!response.ok) {
          const error = await response.json();
          console.error('❌ Erro na resposta:', error);
          throw new Error(error.error || error.details || 'Erro ao fazer upload');
        }

        const data = await response.json();
        console.log('✅ Upload bem-sucedido:', data.url);
        console.log('📏 Tamanho da imagem em base64:', data.size, 'caracteres');
        novasFotos.push(data.url);
      }

      setFormData({ ...formData, fotos: novasFotos });
      console.log('🎉 Todos os uploads concluídos!');
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      alert(`Erro ao fazer upload das imagens: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar se o tamanho total das fotos excede o limite do Firestore (1MB)
    if (tamanhoTotalFotos > limiteFirestore) {
      alert(`O tamanho total das imagens (${(tamanhoTotalFotos / 1024).toFixed(2)} KB) excede o limite do Firestore (1024 KB). Remova algumas imagens ou reduza a qualidade.`);
      return;
    }

    try {
      if (editando) {
        const response = await fetch(`/api/admin/brinquedos/${editando.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || error.details || 'Erro ao atualizar brinquedo');
        }

        const data = await response.json();
        setBrinquedos(brinquedos.map(b => b.id === editando.id ? { ...data, fotos: formData.fotos } : b));
        alert('Brinquedo atualizado com sucesso!');
      } else {
        const response = await fetch('/api/admin/brinquedos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || error.details || 'Erro ao criar brinquedo');
        }

        const data = await response.json();
        setBrinquedos([...brinquedos, { ...data, fotos: formData.fotos }]);
        alert('Brinquedo criado com sucesso.');
      }

      setMostrarFormulario(false);
      setEditando(null);
      setFormData({
        nome: '',
        descricao: '',
        fotos: [],
        dimensoes: '',
        faixa_etaria: '',
        status: 'DISPONIVEL',
        destaque_home: false,
      });
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar brinquedo:', error);
      alert(`Erro ao salvar brinquedo: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleEdit = (brinquedo: Brinquedo) => {
    setEditando(brinquedo);
    setFormData({
      nome: brinquedo.nome,
      descricao: brinquedo.descricao,
      fotos: Array.isArray(brinquedo.fotos) ? brinquedo.fotos : [],
      dimensoes: brinquedo.dimensoes,
      faixa_etaria: brinquedo.faixa_etaria,
      status: brinquedo.status,
      destaque_home: brinquedo.destaque_home || false,
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
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Gestão de Brinquedos</h1>
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
                dimensoes: '',
                faixa_etaria: '',
                status: 'DISPONIVEL',
                destaque_home: false,
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
                <div className="mt-2 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Uso de armazenamento:</span>
                    <span className={`font-medium ${porcentagemUsada > 90 ? 'text-red-600' : porcentagemUsada > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {porcentagemUsada.toFixed(1)}% ({(tamanhoTotalFotos / 1024).toFixed(2)} KB / 1024 KB)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${porcentagemUsada > 90 ? 'bg-red-600' : porcentagemUsada > 70 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{ width: `${Math.min(porcentagemUsada, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Restante: {(tamanhoRestante / 1024).toFixed(2)} KB
                  </p>
                </div>
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="destaque_home"
                  checked={formData.destaque_home}
                  onChange={(e) => setFormData({ ...formData, destaque_home: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="destaque_home" className="text-sm font-medium text-gray-700">
                  Destacar na página inicial
                </label>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
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
    </div>
  );
}
