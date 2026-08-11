'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientePerfil() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar login via API
    fetch('/api/cliente/perfil')
      .then(res => {
        if (!res.ok) {
          router.push('/');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.error) {
          setError(data.error);
        } else if (data) {
          setFormData({
            nome: data.nome || '',
            telefone: data.telefone || '',
            email: data.email || '',
            endereco: data.endereco || '',
          });
        }
      })
      .catch(() => {
        router.push('/');
      });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validar telefone - deve ter exatamente 11 dígitos (DDD + número)
    const telefoneLimpo = formData.telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      setError('O telefone deve ter exatamente 11 dígitos (DDD + número)');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/cliente/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          telefone: telefoneLimpo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Dados atualizados com sucesso!');
      } else {
        setError(data.error || 'Erro ao atualizar dados');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Meu Perfil</h1>
            <p className="text-gray-600">Atualize seus dados pessoais</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone (11 dígitos: DDD + número)
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                value={formData.telefone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50"
                placeholder="(55) 99999-9999"
              />
              <p className="text-xs text-gray-500 mt-1">Exemplo: 559997302463</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <input
                id="endereco"
                name="endereco"
                type="text"
                value={formData.endereco}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-blue-600 text-white py-3 px-6 rounded-xl hover:bg-primary-blue-700 focus:outline-none focus:ring-2 focus:ring-primary-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {loading ? 'Atualizando...' : 'Atualizar Dados'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-primary-blue-600 hover:text-primary-blue-700 font-medium"
            >
              Voltar para o site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
