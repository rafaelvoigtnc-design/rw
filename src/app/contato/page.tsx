'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Camera, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Contato() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    // Simular envio
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-blue-500 via-primary-green-500 to-primary-blue-600 py-16">
        <div className="max-w-[1440px] mx-auto px-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Entre em Contato
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Estamos aqui para ajudar você a planejar a festa perfeita. Entre em contato conosco!
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações de Contato */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary-gray-900 mb-1">WhatsApp</h3>
                  <p className="text-secondary-gray-600 mb-2">(55) 99730-2463</p>
                  <a
                    href="https://wa.me/5555997302463?text=Olá! Gostaria de tirar algumas dúvidas sobre os serviços da RW Brinquedos."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-green-600 hover:text-primary-green-700 font-medium"
                  >
                    Falar no WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary-gray-900 mb-1">Email</h3>
                  <p className="text-secondary-gray-600 mb-2">rwbrinquedos@gmail.com</p>
                  <p className="text-sm text-secondary-gray-500">
                    Respondemos em até 24 horas úteis
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary-gray-900 mb-1">Localização</h3>
                  <p className="text-secondary-gray-600">
                    Nova Candelaria e Região
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-secondary-gray-900 mb-1">Instagram</h3>
                  <p className="text-secondary-gray-600 mb-2">@rwbrinquedos</p>
                  <a
                    href="https://www.instagram.com/rw_brinquedos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-pink-700 hover:text-pink-800 font-medium"
                  >
                    Seguir no Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft p-8">
              <h2 className="text-2xl font-bold text-secondary-gray-900 mb-6">Envie sua Mensagem</h2>

              {enviado ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Mensagem Enviada!</h3>
                  <p className="text-green-700">
                    Obrigado pelo contato. Responderemos em breve!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-gray-700 mb-2">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50 text-gray-900"
                        placeholder="Seu nome"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50 text-gray-900"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50 text-gray-900"
                      placeholder="(55) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-gray-700 mb-2">
                      Mensagem
                    </label>
                    <textarea
                      value={formData.mensagem}
                      onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue-500 focus:border-primary-blue-500 bg-gray-50 resize-none text-gray-900"
                      placeholder="Conte-nos sobre seu evento..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-primary-green-500 text-white py-4 rounded-xl font-semibold hover:bg-primary-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-102 transition-transform"
                  >
                    {enviando ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar Mensagem
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Dica */}
              <div className="mt-6 p-4 bg-primary-blue-50 rounded-xl border border-primary-blue-200">
                <p className="text-sm text-primary-blue-800">
                  <strong>Dica:</strong> Para agilizar seu atendimento, tenha em mãos: data do evento, local, quantidade de convidados e tipo de brinquedos desejados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
