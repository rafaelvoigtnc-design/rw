'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminBackup() {
  const router = useRouter();
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleBackup = async () => {
    setLoadingBackup(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/backup');
      if (response.ok) {
        const data = await response.json();
        
        // Criar e baixar arquivo JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-rw-brinquedos-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setMessage({ type: 'success', text: 'Backup realizado com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao realizar backup' });
      }
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      setMessage({ type: 'error', text: 'Erro ao realizar backup' });
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingRestore(true);
    setMessage(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!confirm('ATENÇÃO: Isso vai substituir todos os dados do sistema. Deseja continuar?')) {
        setLoadingRestore(false);
        return;
      }

      const response = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Restore realizado com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao realizar restore' });
      }
    } catch (error) {
      console.error('Erro ao fazer restore:', error);
      setMessage({ type: 'error', text: 'Erro ao realizar restore. Verifique o arquivo.' });
    } finally {
      setLoadingRestore(false);
      event.target.value = '';
    }
  };

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
            <h1 className="text-xl font-bold text-gray-900">Backup e Restore</h1>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup do Sistema</h2>
          <p className="text-gray-600 mb-4">
            Faça um backup completo de todos os dados do sistema (brinquedos, clientes, locações, transações, etc.).
          </p>
          <button
            onClick={handleBackup}
            disabled={loadingBackup}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Download className="w-5 h-5" />
            {loadingBackup ? 'Gerando backup...' : 'Baixar Backup'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Restore do Sistema</h2>
          <p className="text-gray-600 mb-4">
            Restaure um backup anterior. <strong>ATENÇÃO:</strong> Isso vai substituir todos os dados atuais do sistema.
          </p>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 cursor-pointer">
              <Upload className="w-5 h-5" />
              {loadingRestore ? 'Restaurando...' : 'Carregar Backup'}
              <input
                type="file"
                accept=".json"
                onChange={handleRestore}
                disabled={loadingRestore}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Aviso Importante</h3>
              <p className="text-yellow-700 text-sm">
                O restore substituirá todos os dados do sistema. Certifique-se de fazer um backup antes de realizar
                qualquer restore. Recomenda-se fazer backups regulares para evitar perda de dados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
