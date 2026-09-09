'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        console.log('❌ Sem token no localStorage');
        router.push('/admin/login');
        return;
      }

      const payload = await verifyToken(token);
      
      if (!payload || payload.type !== 'admin') {
        console.log('❌ Token inválido ou não é admin, limpando...');
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }

      console.log('✅ Token válido, permitindo acesso');
      setAuthenticated(true);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
