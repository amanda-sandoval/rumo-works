'use client';

import React, { useState } from 'react';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { ChallengeSection } from '@/components/landing/ChallengeSection';
import { MethodologySection } from '@/components/landing/MethodologySection';
import { AboutSection } from '@/components/landing/AboutSection';
import { TargetAudienceSection } from '@/components/landing/TargetAudienceSection';
import { InterestSection } from '@/components/landing/InterestSection';
import { Footer } from '@/components/landing/Footer';
import { InterestModal } from '@/components/landing/InterestModal';

export default function HomePage() {
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

  const handleOpenInterest = () => {
    setIsInterestModalOpen(true);
  };

  const handleCloseInterest = () => {
    setIsInterestModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-charcoal-500 selection:bg-sage-700 selection:text-white">
      {/* Site Header */}
      <Header onOpenInterest={handleOpenInterest} />

      {/* Main Landing Content */}
      <main className="flex-1 w-full">
        {/* Section A: Hero */}
        <HeroSection onOpenInterest={handleOpenInterest} />

        {/* Section B: The Challenge */}
        <ChallengeSection />

        {/* Section C: The Methodology */}
        <MethodologySection />

        {/* Section D: Who I Am (Sobre a Amanda) */}
        <AboutSection />

        {/* Section E: Who This Is For */}
        <TargetAudienceSection />

        {/* Section F: Interest / Call to Action */}
        <InterestSection onOpenInterest={handleOpenInterest} />
      </main>

      {/* Section G: Footer */}
      <Footer onOpenInterest={handleOpenInterest} />

      {/* Accessible Interest Modal */}
      <InterestModal
        isOpen={isInterestModalOpen}
        onClose={handleCloseInterest}
      />
    </div>
  );
}
