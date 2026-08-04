'use client';

import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  Users, 
  DollarSign, 
  Star, 
  Tag, 
  FileText, 
  LogOut,
  TrendingUp,
  ShoppingCart,
  Settings,
  Building2,
  FileCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Relatórios financeiros e métricas',
      icon: LayoutDashboard,
      color: 'bg-primary-blue-500',
      path: '/admin/dashboard',
    },
    {
      title: 'Brinquedos',
      description: 'CRUD completo do catálogo',
      icon: Package,
      color: 'bg-primary-green-500',
      path: '/admin/brinquedos',
    },
    {
      title: 'Locações',
      description: 'Agenda de locações',
      icon: ShoppingCart,
      color: 'bg-primary-orange-500',
      path: '/admin/locacoes',
    },
    {
      title: 'Calendário',
      description: 'Visualização de locações',
      icon: Calendar,
      color: 'bg-primary-yellow-500',
      path: '/admin/calendario',
    },
    {
      title: 'Clientes',
      description: 'Listagem de clientes',
      icon: Users,
      color: 'bg-pink-500',
      path: '/admin/clientes',
    },
    {
      title: 'Financeiro',
      description: 'Lançamentos e relatórios',
      icon: DollarSign,
      color: 'bg-red-500',
      path: '/admin/financeiro',
    },
    {
      title: 'Avaliações',
      description: 'Aprovar avaliações',
      icon: Star,
      color: 'bg-purple-500',
      path: '/admin/avaliacoes',
    },
    {
      title: 'Promoções',
      description: 'Gerenciar promoções',
      icon: Tag,
      color: 'bg-teal-500',
      path: '/admin/promocoes',
    },
    {
      title: 'Dados da Empresa',
      description: 'Informações cadastrais',
      icon: Building2,
      color: 'bg-cyan-500',
      path: '/admin/dados-empresa',
    },
    {
      title: 'Contratos',
      description: 'Gerenciar contratos de locação',
      icon: FileCheck,
      color: 'bg-amber-500',
      path: '/admin/contratos',
    },
    {
      title: 'Banners',
      description: 'Gerenciar banners do site',
      icon: FileText,
      color: 'bg-indigo-500',
      path: '/admin/banners',
    },
    {
      title: 'Conteúdo',
      description: 'Editar textos e imagens',
      icon: FileText,
      color: 'bg-gray-500',
      path: '/admin/conteudo',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <img
                src="/logo-sem-fundo.png"
                alt="RW Brinquedos"
                className="h-8 md:h-10 w-auto"
              />
              <div>
                <h1 className="text-sm md:text-xl font-bold text-secondary-gray-900">Painel Administrativo</h1>
                <p className="text-[10px] md:text-sm text-secondary-gray-500 hidden md:block">RW Brinquedos</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-red-500 text-white rounded-lg md:rounded-xl hover:bg-red-600 transition-colors font-medium text-xs md:text-sm"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 lg:gap-6 mb-6 md:mb-8">
          {[
            { label: 'Brinquedos', value: '0', icon: Package, color: 'bg-primary-blue-500' },
            { label: 'Locações', value: '0', icon: ShoppingCart, color: 'bg-primary-green-500' },
            { label: 'Clientes', value: '0', icon: Users, color: 'bg-primary-orange-500' },
            { label: 'Faturamento', value: '0,00', prefix: 'R$', icon: TrendingUp, color: 'bg-primary-yellow-500' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl md:rounded-2xl shadow-soft p-3 md:p-6"
            >
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className={`w-8 h-8 md:w-12 md:h-12 ${stat.color} rounded-lg md:rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] md:text-2xl font-bold text-secondary-gray-900 block">{stat.prefix}{stat.value}</span>
                </div>
              </div>
              <p className="text-[8px] md:text-base text-secondary-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="hover:-translate-y-1 transition-all duration-300"
            >
              <button
                onClick={() => router.push(item.path)}
                className="w-full bg-white rounded-xl md:rounded-2xl shadow-soft p-3 md:p-6 text-left hover:shadow-medium transition-all duration-300 group"
              >
                <div className="flex items-start gap-2 md:gap-4">
                  <div className={`w-10 h-10 md:w-14 md:h-14 ${item.color} rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs md:text-lg font-bold text-secondary-gray-900 mb-0.5 md:mb-1 group-hover:text-primary-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[10px] md:text-sm text-gray-800 hidden md:block">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-soft p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-secondary-gray-900 mb-3 md:mb-4">Ações Rápidas</h2>
          <div className="flex gap-2 md:gap-4 overflow-x-auto">
            <button
              onClick={() => router.push('/admin/brinquedos')}
              className="px-3 py-2 md:px-6 md:py-3 bg-primary-green-500 text-white rounded-lg md:rounded-xl text-xs md:text-base font-medium hover:bg-primary-green-600 transition-colors hover:scale-105 transition-transform flex-shrink-0"
            >
              + Novo Brinquedo
            </button>
            <button
              onClick={() => router.push('/admin/promocoes')}
              className="px-3 py-2 md:px-6 md:py-3 bg-primary-orange-500 text-white rounded-lg md:rounded-xl text-xs md:text-base font-medium hover:bg-primary-orange-600 transition-colors hover:scale-105 transition-transform flex-shrink-0"
            >
              + Nova Promoção
            </button>
            <button
              onClick={() => router.push('/admin/locacoes')}
              className="px-3 py-2 md:px-6 md:py-3 bg-primary-blue-500 text-white rounded-lg md:rounded-xl text-xs md:text-base font-medium hover:bg-primary-blue-600 transition-colors hover:scale-105 transition-transform flex-shrink-0"
            >
              + Nova Locação
            </button>
            <button
              onClick={() => router.push('/admin/contratos')}
              className="px-3 py-2 md:px-6 md:py-3 bg-amber-500 text-white rounded-lg md:rounded-xl text-xs md:text-base font-medium hover:bg-amber-600 transition-colors hover:scale-105 transition-transform flex-shrink-0"
            >
              + Novo Contrato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
