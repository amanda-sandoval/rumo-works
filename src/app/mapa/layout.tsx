'use client';

import React, { useState } from 'react';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { InterestModal } from '@/components/landing/InterestModal';

export default function MapaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

  const handleOpenInterest = () => {
    setIsInterestModalOpen(true);
  };

  const handleCloseInterest = () => {
    setIsInterestModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-charcoal-500 font-sans antialiased selection:bg-cobalt-500 selection:text-white">
      {/* Cabeçalho Oficial Rumo Works (Idêntico à Página Inicial) */}
      <Header onOpenInterest={handleOpenInterest} />

      {/* Conteúdo Principal do Mapa Rumo */}
      <main className="flex-1 w-full">{children}</main>

      {/* Rodapé Oficial Rumo Works (Idêntico à Página Inicial) */}
      <Footer onOpenInterest={handleOpenInterest} />

      {/* Modal de Interesse Oficial */}
      <InterestModal
        isOpen={isInterestModalOpen}
        onClose={handleCloseInterest}
      />
    </div>
  );
}
