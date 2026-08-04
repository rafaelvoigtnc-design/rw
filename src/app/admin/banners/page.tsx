'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Pause, Play, Image as ImageIcon } from 'lucide-react';
import ImageEditor from '@/components/ImageEditor';

interface Banner {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  botao_primario: string;
  link_primario: string;
  botao_secundario: string;
  link_secundario: string;
  gradiente: string;
  imagem: string;
  badge?: string;
  ativo: boolean;
  ordem: number;
}

export default function AdminBanners() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState('');

  const gradients = [
    'from-primary-blue-400 via-primary-blue-500 to-primary-green-400',
    'from-primary-yellow-400 via-primary-orange-400 to-primary-orange-500',
    'from-primary-green-400 via-primary-blue-400 to-primary-blue-500',
    'from-primary-pink-400 via-primary-purple-400 to-primary-blue-400',
    'from-primary-orange-400 via-primary-red-400 to-primary-pink-400',
  ];

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      console.log('Iniciando busca de banners...');
      const response = await fetch('/api/admin/banners');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      if (Array.isArray(data)) {
        console.log(`Carregando ${data.length} banners`);
        setBanners(data);
      } else if (data.error) {
        console.error('Erro na API:', data.error);
        setBanners([]);
      } else {
        console.log('Dados não é array, convertendo:', data);
        setBanners([]);
      }
    } catch (error) {
      console.error('Erro ao buscar banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (bannerData: Partial<Banner>) => {
    try {
      const url = editingBanner 
        ? `/api/admin/banners/${editingBanner.id}`
        : '/api/admin/banners';
      
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingBanner(null);
        fetchBanners();
      }
    } catch (error) {
      console.error('Erro ao salvar banner:', error);
    }
  };

  const handleToggleActive = async (id: string, ativo: boolean) => {
    try {
      await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo }),
      });
      fetchBanners();
    } catch (error) {
      console.error('Erro ao alterar status do banner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      fetchBanners();
    } catch (error) {
      console.error('Erro ao excluir banner:', error);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleImageEdit = (imageUrl: string) => {
    setEditingImage(imageUrl);
    setShowImageEditor(true);
  };

  const handleImageSave = (croppedImageUrl: string) => {
    if (editingBanner) {
      setEditingBanner({ ...editingBanner, imagem: croppedImageUrl });
    }
    setShowImageEditor(false);
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
            <h1 className="text-xl font-bold text-gray-900">Gestão de Banners</h1>
            <button
              onClick={() => {
                setEditingBanner(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue-500 text-white rounded-lg hover:bg-primary-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Novo Banner</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          <BannerForm
            banner={editingBanner}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingBanner(null);
            }}
            onEditImage={handleImageEdit}
            gradients={gradients}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`bg-white rounded-2xl shadow-soft overflow-hidden ${
                  !banner.ativo ? 'opacity-60' : ''
                }`}
              >
                <div className={`h-48 bg-gradient-to-br ${banner.gradiente} relative`}>
                  {banner.imagem && (
                    <img
                      src={banner.imagem}
                      alt={banner.titulo}
                      className="w-full h-full object-cover opacity-30"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{banner.titulo}</span>
                  </div>
                  {banner.badge && (
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-white text-sm">{banner.badge}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{banner.titulo}</h3>
                  <p className="text-sm text-gray-600 mb-4">{banner.subtitulo}</p>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(banner.id, banner.ativo)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        banner.ativo
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {banner.ativo ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span className="text-sm">Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span className="text-sm">Ativar</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm hidden md:inline">Editar</span>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm hidden md:inline">Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showImageEditor && (
        <ImageEditor
          imageUrl={editingImage}
          onSave={handleImageSave}
          onCancel={() => setShowImageEditor(false)}
        />
      )}
    </div>
  );
}

function BannerForm({
  banner,
  onSave,
  onCancel,
  onEditImage,
  gradients,
}: {
  banner: Banner | null;
  onSave: (data: Partial<Banner>) => void;
  onCancel: () => void;
  onEditImage: (imageUrl: string) => void;
  gradients: string[];
}) {
  const [formData, setFormData] = useState<Partial<Banner>>(
    banner || {
      titulo: '',
      subtitulo: '',
      descricao: '',
      botao_primario: '',
      link_primario: '',
      botao_secundario: '',
      link_secundario: '',
      gradiente: gradients[0],
      imagem: '',
      badge: '',
      ativo: true,
      ordem: 0,
    }
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Converter para base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imagem: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {banner ? 'Editar Banner' : 'Novo Banner'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtítulo
          </label>
          <input
            type="text"
            value={formData.subtitulo}
            onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto Botão Primário
            </label>
            <input
              type="text"
              value={formData.botao_primario}
              onChange={(e) => setFormData({ ...formData, botao_primario: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Botão Primário
            </label>
            <input
              type="text"
              value={formData.link_primario}
              onChange={(e) => setFormData({ ...formData, link_primario: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto Botão Secundário
            </label>
            <input
              type="text"
              value={formData.botao_secundario}
              onChange={(e) => setFormData({ ...formData, botao_secundario: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Botão Secundário
            </label>
            <input
              type="text"
              value={formData.link_secundario}
              onChange={(e) => setFormData({ ...formData, link_secundario: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gradiente
          </label>
          <select
            value={formData.gradiente}
            onChange={(e) => setFormData({ ...formData, gradiente: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
          >
            {gradients.map((grad) => (
              <option key={grad} value={grad}>
                {grad}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagem
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, imagem: '' })}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Limpar
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.imagem}
                onChange={(e) => setFormData({ ...formData, imagem: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="Ou cole URL da imagem..."
              />
              {formData.imagem && (
                <button
                  type="button"
                  onClick={() => onEditImage(formData.imagem || '')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Editar</span>
                </button>
              )}
            </div>
          </div>
          {formData.imagem && (
            <img
              src={formData.imagem}
              alt="Preview"
              className="mt-2 w-full h-32 object-cover rounded-lg"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Badge (opcional)
          </label>
          <input
            type="text"
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            placeholder="Ex: Promoção do Mês"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ativo"
            checked={formData.ativo}
            onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
            Banner ativo
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-primary-blue-500 text-white rounded-lg hover:bg-primary-blue-600 transition-colors"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
