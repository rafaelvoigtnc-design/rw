'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, X } from 'lucide-react';

interface CampoFormulario {
  nome_campo: string;
  tipo: 'texto' | 'numero' | 'data';
  obrigatorio: boolean;
}

export default function EditarPromocional() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    regras: '',
    fotos: [] as string[],
    data_inicio: '',
    data_fim: '',
  });
  const [camposFormulario, setCamposFormulario] = useState<CampoFormulario[]>([]);

  // Calcular tamanho total das fotos em base64
  const calcularTamanhoTotalFotos = () => {
    return formData.fotos.reduce((total, foto) => total + foto.length, 0);
  };

  const tamanhoTotalFotos = calcularTamanhoTotalFotos();
  const limiteFirestore = 1000000; // 1MB em caracteres
  const tamanhoRestante = limiteFirestore - tamanhoTotalFotos;
  const porcentagemUsada = (tamanhoTotalFotos / limiteFirestore) * 100;

  useEffect(() => {
    fetchPromocional();
  }, []);

  const fetchPromocional = async () => {
    try {
      const id = params.id as string;
      if (!id) {
        console.error('ID não encontrado');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/promocionais/${id}`);
      const data = await response.json();

      console.log('Dados do promocional:', data);

      setFormData({
        titulo: data.titulo || '',
        descricao: data.descricao || '',
        regras: data.regras || '',
        fotos: Array.isArray(data.fotos) ? data.fotos : [],
        data_inicio: data.data_inicio ? data.data_inicio.split('T')[0] : '',
        data_fim: data.data_fim ? data.data_fim.split('T')[0] : '',
      });

      setCamposFormulario(Array.isArray(data.campos_formulario) ? data.campos_formulario : []);
    } catch (error) {
      console.error('Erro ao buscar promocional:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limite de 10 imagens
    const MAX_FOTOS = 10;
    if (formData.fotos.length + files.length > MAX_FOTOS) {
      alert(`Você pode ter no máximo ${MAX_FOTOS} fotos. Atualmente tem ${formData.fotos.length} fotos.`);
      return;
    }

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
          throw new Error(error.error || error.details || 'Erro ao fazer upload');
        }

        const data = await response.json();
        novasFotos.push(data.url);
      }

      setFormData({ ...formData, fotos: novasFotos });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert(`Erro ao fazer upload das imagens: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const novasFotos = formData.fotos.filter((_, i) => i !== index);
    setFormData({ ...formData, fotos: novasFotos });
  };

  const addCampo = () => {
    setCamposFormulario([
      ...camposFormulario,
      { nome_campo: '', tipo: 'texto', obrigatorio: true },
    ]);
  };

  const removeCampo = (index: number) => {
    setCamposFormulario(camposFormulario.filter((_, i) => i !== index));
  };

  const updateCampo = (index: number, field: keyof CampoFormulario, value: any) => {
    const novosCampos = [...camposFormulario];
    novosCampos[index][field] = value;
    setCamposFormulario(novosCampos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar se o tamanho total das fotos excede o limite do Firestore (1MB)
    if (tamanhoTotalFotos > limiteFirestore) {
      alert(`O tamanho total das imagens (${(tamanhoTotalFotos / 1024).toFixed(2)} KB) excede o limite do Firestore (1024 KB). Remova algumas imagens ou reduza a qualidade.`);
      return;
    }

    setSaving(true);

    try {
      const id = params.id as string;
      const response = await fetch(`/api/admin/promocionais/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          campos_formulario: camposFormulario,
        }),
      });

      if (response.ok) {
        router.push('/admin/promocoes');
      } else {
        const error = await response.json();
        throw new Error(error.error || error.details || 'Erro ao atualizar promocional');
      }
    } catch (error) {
      console.error('Erro ao atualizar promocional:', error);
      alert(`Erro ao atualizar promocional: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
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
              onClick={() => router.push('/admin/promocoes')}
              className="text-gray-800 hover:text-gray-900"
            >
              ← Voltar
            </button>
            <h1 className="text-xl font-bold text-gray-900">Editar Promocional</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Regras</label>
                <textarea
                  value={formData.regras}
                  onChange={(e) => setFormData({ ...formData, regras: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Imagens</h2>

            {/* Barra de progresso */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Tamanho usado: {(tamanhoTotalFotos / 1024).toFixed(2)} KB</span>
                <span>Limite: 1024 KB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-colors ${
                    porcentagemUsada > 90 ? 'bg-red-500' : porcentagemUsada > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(porcentagemUsada, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {tamanhoRestante > 0 ? `${(tamanhoRestante / 1024).toFixed(2)} KB restantes` : 'Limite atingido'}
              </p>
            </div>

            {/* Upload */}
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading || tamanhoRestante <= 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:opacity-50"
              />
              {uploading && <p className="text-sm text-gray-500 mt-1">Enviando imagens...</p>}
            </div>

            {/* Preview das imagens */}
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
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Campos do Formulário</h2>
            <p className="text-sm text-gray-500 mb-4">
              Defina quais campos os participantes devem preencher
            </p>

            <div className="space-y-3">
              {camposFormulario.map((campo, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Nome do campo"
                      value={campo.nome_campo}
                      onChange={(e) => updateCampo(index, 'nome_campo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={campo.tipo}
                      onChange={(e) => updateCampo(index, 'tipo', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
                    >
                      <option value="texto">Texto</option>
                      <option value="numero">Número</option>
                      <option value="data">Data</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={campo.obrigatorio}
                      onChange={(e) => updateCampo(index, 'obrigatorio', e.target.checked)}
                      className="mr-1"
                    />
                    <label className="text-sm text-gray-700">Obrigatório</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCampo(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addCampo}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar Campo
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/promocoes')}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
