'use client';

import React, { useEffect, useRef } from 'react';
import { X, Compass, Sparkles } from 'lucide-react';
import { MentoringInterestForm } from './MentoringInterestForm';

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterestModal: React.FC<InterestModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-700/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card NATIVO com rolagem suave */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#FAF8F5] border border-borderWarm rounded-3xl shadow-2xl p-6 sm:p-9 z-10 transition-all text-charcoal-500 animate-in zoom-in-95 duration-200"
      >
        {/* Botão de Fechar (X) */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 text-charcoal-300 hover:text-charcoal-600 hover:bg-ivory-200/80 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 cursor-pointer"
          aria-label="Fechar formulário"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho do Formulário */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-200 mb-3">
            <Compass className="w-3.5 h-3.5 text-sage-700" />
            <span>Mentoria Individual • Rumo Works</span>
          </div>

          <h2
            id="modal-headline"
            className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-500 tracking-tight mb-2"
          >
            Formulário de Interesse na Mentoria
          </h2>

          <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed">
            Compartilhe um panorama do seu momento profissional. Suas informações serão analisadas pessoalmente pela mentora para avaliar se a abordagem é indicada aos seus objetivos.
          </p>
        </div>

        {/* Formulário Nativo Incorporado */}
        <MentoringInterestForm onSuccess={onClose} source="site_modal" />
      </div>
    </div>
  );
};
