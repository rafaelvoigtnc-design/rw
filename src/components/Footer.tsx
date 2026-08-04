import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary-navy-900 text-white py-8 md:py-16">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 mb-6 md:mb-12">
          {/* Logo e Descrição */}
          <div>
            <img 
              src="/logo-sem-fundo.png" 
              alt="RW Brinquedos" 
              className="h-10 md:h-16 w-auto mb-3 md:mb-6"
            />
            <p className="text-gray-300 text-xs md:text-base leading-relaxed mb-3 md:mb-6 hidden md:block">
              A melhor diversão para seus eventos! Locação de brinquedos, infláveis e itens para festas com qualidade e segurança.
            </p>
            <div className="flex gap-3 md:gap-4">
              <a
                href="https://www.instagram.com/rw_brinquedos"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:opacity-80 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/5555997302463"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Phone className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="font-semibold text-sm md:text-lg mb-3 md:mb-6">Navegação</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors text-xs md:text-base">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-gray-300 hover:text-white transition-colors text-xs md:text-base">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/promocoes" className="text-gray-300 hover:text-white transition-colors text-xs md:text-base">
                  Promoções
                </Link>
              </li>
              <li>
                <Link href="/depoimentos" className="text-gray-300 hover:text-white transition-colors text-xs md:text-base">
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-300 hover:text-white transition-colors text-xs md:text-base">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-300 hover:text-white transition-colors text-xs md:text-base">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-sm md:text-lg mb-3 md:mb-6">Contato</h4>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start gap-2 md:gap-3">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-primary-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-xs md:text-sm">WhatsApp</p>
                  <a href="https://wa.me/5555997302463" className="text-white hover:text-primary-green-400 transition-colors text-xs md:text-sm">
                    (55) 99730-2463
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-xs md:text-sm">Email</p>
                  <a href="mailto:rwbrinquedos@gmail.com" className="text-white hover:text-primary-blue-400 transition-colors text-xs md:text-sm">
                    rwbrinquedos@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-xs md:text-sm">Localização</p>
                  <p className="text-white text-xs md:text-sm">Nova Candelaria e Região</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Linha inferior */}
        <div className="pt-4 md:pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
            <p className="text-gray-400 text-[10px] md:text-sm">
              &copy; 2024 RW Brinquedos. Todos os direitos reservados.
            </p>
            <div className="flex gap-4 md:gap-6 text-[10px] md:text-sm">
              <Link href="/termos" className="text-gray-400 hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <Link href="/privacidade" className="text-gray-400 hover:text-white transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
