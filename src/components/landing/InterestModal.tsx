'use client';

import React, { useEffect, useRef } from 'react';
import { X, Sparkles, ArrowUpRight, Compass } from 'lucide-react';
import { siteConfig } from '@/config/site';

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

  const { modal, formUrl } = siteConfig.interest;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-700/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[#FAF8F5] border border-borderWarm rounded-2xl shadow-2xl p-6 sm:p-8 z-10 transition-all text-charcoal-500"
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 text-charcoal-200 hover:text-charcoal-500 hover:bg-ivory-200/80 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700"
          aria-label="Fechar janela"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge and Icon */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sage-100 text-sage-800 border border-sage-200/70">
            <Compass className="w-3.5 h-3.5 text-sage-700" />
            {modal.badge}
          </span>
        </div>

        {/* Title */}
        <h3
          id="modal-headline"
          className="font-serif text-2xl font-semibold text-charcoal-500 mb-3 tracking-tight"
        >
          {modal.title}
        </h3>

        {/* Message */}
        <p className="text-sm text-charcoal-200 leading-relaxed mb-5">
          {modal.message}
        </p>

        {/* Status Callout Box */}
        <div className="bg-white border border-borderWarm rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
            <p className="text-xs text-charcoal-200 leading-normal">
              {modal.statusNote}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {formUrl ? (
            <a
              href={formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-sage-700 hover:bg-sage-800 text-ivory-50 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700"
            >
              <span>{modal.externalActionText}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          ) : (
            <a
              href={siteConfig.mentor.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-sage-700 hover:bg-sage-800 text-ivory-50 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700"
            >
              <span>Acompanhar pelo LinkedIn</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-charcoal-300 hover:text-charcoal-500 bg-transparent hover:bg-ivory-200/60 border border-borderWarm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700"
          >
            {modal.closeText}
          </button>
        </div>
      </div>
    </div>
  );
};
