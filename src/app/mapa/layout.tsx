'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Trash2, KeyRound } from 'lucide-react';

export default function MapaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  const handleClearLocalData = () => {
    try {
      localStorage.removeItem('mapa_rumo_session');
      localStorage.removeItem('mapa_rumo_answers');
      setDeleteMessage('Seus dados locais foram removidos deste navegador com sucesso.');
      setTimeout(() => {
        window.location.href = '/mapa';
      }, 1500);
    } catch {
      setDeleteMessage('Não foi possível limpar o armazenamento local.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-charcoal-500 font-sans antialiased selection:bg-cobalt-500 selection:text-white">
      {/* Cabeçalho Editorial do Mapa Rumo */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-borderWarm transition-all print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo e Identidade */}
          <Link href="/mapa" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-8 h-8 rounded-lg bg-cobalt-500 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-baseline">
              <span className="font-serif text-lg font-semibold text-charcoal-500 tracking-tight">
                Rumo
              </span>
              <span className="ml-1 text-xs font-semibold uppercase tracking-widest text-cobalt-600">
                Works
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cobalt-100 text-cobalt-700 border border-cobalt-200">
                Mapa Rumo
              </span>
            </div>
          </Link>

          {/* Ações Rápidas no Cabeçalho */}
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="https://www.rumoworkshub.com.br"
              className="hidden sm:inline-block text-charcoal-300 hover:text-charcoal-500 transition-colors"
            >
              ← Voltar ao site institucional
            </Link>

            <Link
              href="/mapa/oferta"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borderWarm bg-white text-charcoal-400 hover:text-cobalt-600 hover:border-cobalt-200 transition-all font-medium"
              title="Acesso de teste ou desbloqueio"
            >
              <KeyRound className="w-3.5 h-3.5 text-cobalt-500" />
              <span>Acesso de Teste / Desbloquear</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full">{children}</main>

      {/* Rodapé do Produto com Governança e LGPD */}
      <footer className="w-full bg-[#F5F2EC] border-t border-borderWarm py-8 text-xs text-charcoal-300 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sage-800" />
            <span>
              <strong>Privacidade & LGPD:</strong> Seus dados são processados para fins exclusivos de autoconhecimento. Não comercializamos suas informações nem utilizamos para anúncios.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1 text-charcoal-300 hover:text-terracotta-600 transition-colors underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir dados deste navegador</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modal de Confirmação de Exclusão de Dados */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-borderWarm">
            <h3 className="font-serif text-lg font-semibold text-charcoal-500 mb-2">
              Excluir dados locais do Mapa Rumo?
            </h3>
            <p className="text-xs text-charcoal-300 leading-relaxed mb-6">
              Esta ação removerá todas as respostas salvas temporariamente neste navegador. Caso não tenha exportado seu relatório, ele deixará de ser acessível neste dispositivo.
            </p>

            {deleteMessage ? (
              <p className="text-xs font-semibold text-sage-800 mb-4">{deleteMessage}</p>
            ) : (
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-charcoal-300 hover:bg-ivory-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleClearLocalData}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-terracotta-600 hover:bg-terracotta-700 text-white"
                >
                  Confirmar e Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
