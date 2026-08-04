'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Phone } from 'lucide-react';
import AuthModal from './AuthModal';
import CarrinhoModal from './CarrinhoModal';

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCarrinhoOpen, setIsCarrinhoOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItems, setCartItems] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = document.cookie.match(/client_token=([^;]+)/)?.[1];
    setIsLoggedIn(!!token);
    
    if (token) {
      fetch('/api/carrinho')
        .then(res => res.json())
        .then(data => {
          setCartItems(data.length || 0);
        })
        .catch(() => setCartItems(0));
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await fetch('/api/cliente/logout', { method: 'POST' });
    setIsLoggedIn(false);
    setCartItems(0);
  };


  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-100 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-soft py-3'
            : 'bg-white shadow-sm py-4'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/logo-sem-fundo.png"
                alt="RW Brinquedos"
                className="h-12 w-auto hover:scale-105 transition-transform duration-200"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {[
                { href: '/', label: 'Home' },
                { href: '/catalogo', label: 'Catálogo' },
                { href: '/promocoes', label: 'Promoções' },
                { href: '/depoimentos', label: 'Depoimentos' },
                { href: '/sobre', label: 'Sobre' },
                { href: '/contato', label: 'Contato' },
              ].map((item) => (
                <div key={item.href} className="hover:scale-105 transition-transform duration-200">
                  <Link 
                    href={item.href} 
                    className={`text-base font-medium relative ${
                      pathname === item.href 
                        ? 'text-primary-blue-600' 
                        : 'text-secondary-gray-700 hover:text-primary-blue-600'
                    }`}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-blue-600 rounded-full" />
                    )}
                  </Link>
                </div>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <a
                href="https://wa.me/5555997302463?text=Olá! Gostaria de saber mais sobre os serviços da RW Brinquedos."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-green-50 text-primary-green-600 hover:bg-primary-green-100 transition-colors hover:scale-105"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>

              {cartItems > 0 && (
                <div className="hover:scale-105 transition-transform duration-200">
                  <button
                    onClick={() => setIsCarrinhoOpen(true)}
                    className="relative p-2 rounded-full bg-secondary-gray-100 hover:bg-secondary-gray-200 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 text-secondary-gray-700" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {cartItems}
                    </span>
                  </button>
                </div>
              )}

              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/cliente/perfil"
                    className="px-6 py-2.5 rounded-full bg-primary-blue-500 text-white font-semibold hover:bg-primary-blue-600 transition-colors shadow-soft hover:scale-105"
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2.5 rounded-full bg-secondary-gray-100 text-secondary-gray-700 hover:bg-secondary-gray-200 font-semibold transition-colors hover:scale-105"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-2.5 rounded-full bg-primary-green-500 text-white font-semibold hover:bg-primary-green-600 transition-colors shadow-soft hover:scale-105"
                >
                  Entrar / Cadastrar
                </button>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-3">
              {cartItems > 0 && (
                <button
                  onClick={() => setIsCarrinhoOpen(true)}
                  className="relative p-1.5 rounded-full bg-secondary-gray-100"
                >
                  <ShoppingCart className="w-4 h-4 text-secondary-gray-700" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartItems}
                  </span>
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 rounded-lg hover:bg-secondary-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-900" /> : <Menu className="w-5 h-5 text-gray-900" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-200 animate-in slide-in-from-top duration-300"
            >
              <div className="px-6 py-4 space-y-4">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/catalogo', label: 'Catálogo' },
                  { href: '/promocoes', label: 'Promoções' },
                  { href: '/depoimentos', label: 'Depoimentos' },
                  { href: '/sobre', label: 'Sobre' },
                  { href: '/contato', label: 'Contato' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-base font-medium text-gray-900 hover:text-primary-blue-600 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <a
                    href="https://wa.me/5555997302463"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-full bg-primary-green-50 text-primary-green-600 font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </a>
                  
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      <Link
                        href="/cliente/perfil"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 rounded-full bg-primary-blue-500 text-white font-semibold text-center"
                      >
                        Perfil
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 rounded-full bg-secondary-gray-100 text-secondary-gray-700 font-semibold"
                      >
                        Sair
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-full bg-primary-green-500 text-white font-semibold"
                    >
                      Entrar / Cadastrar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <CarrinhoModal
        isOpen={isCarrinhoOpen}
        onClose={() => setIsCarrinhoOpen(false)}
      />
    </>
  );
}
