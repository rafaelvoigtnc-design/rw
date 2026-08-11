'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ClientePerfil() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
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
            senha: '',
            confirmarSenha: '',
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

  const formatTelefone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, telefone: formatTelefone(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validar telefone
    const telefoneLimpo = formData.telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      setError('O telefone deve ter exatamente 11 dígitos');
      setLoading(false);
      return;
    }

    // Validar senha se fornecida
    if (formData.senha && formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
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
          nome: formData.nome,
          telefone: telefoneLimpo,
          email: formData.email,
          senha: formData.senha || undefined,
          endereco: formData.endereco,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Dados atualizados com sucesso!');
        // Limpar campos de senha após sucesso
        setFormData({
          ...formData,
          senha: '',
          confirmarSenha: '',
        });
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                value={formData.telefone}
                onChange={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Alterar Senha</h3>
              <p className="text-sm text-gray-600 mb-4">Deixe em branco para manter a senha atual</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha
                  </label>
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="Digite a nova senha (mínimo 6 caracteres)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    placeholder="Confirme a nova senha"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
