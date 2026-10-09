'use client';

import React from 'react';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { LinkedInLink } from '@/components/brand/LinkedInLink';
import { UserCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { mentor } = siteConfig;

  return (
    <section
      id="sobre"
      className="relative py-20 md:py-28 bg-[#2E473B] text-ivory-50 border-y border-[#3A5647] overflow-hidden scroll-mt-20 selection:bg-[#A95840] selection:text-white"
    >
      {/* Ambient background depth */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#3B5A4B]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#23372D]/90 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Portrait Column with Concentric Target / Radar Graphics */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-start lg:items-center">
            <div className="relative group">
              {/* BRAND TARGET / RADAR GRAPHIC: radiating seamlessly from portrait center */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] sm:w-[860px] sm:h-[860px] pointer-events-none select-none -z-10 flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 800 800"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Concentric calibrated target rings matching LinkedIn cover banner */}
                  <circle cx="400" cy="400" r="150" stroke="#FAF8F5" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.22" />
                  <circle cx="400" cy="400" r="185" stroke="#A95840" strokeWidth="1.6" strokeDasharray="5 5" opacity="0.4" />
                  <circle cx="400" cy="400" r="230" stroke="#FAF8F5" strokeWidth="1.4" strokeDasharray="7 7" opacity="0.24" />
                  <circle cx="400" cy="400" r="285" stroke="#FAF8F5" strokeWidth="1.2" strokeDasharray="9 9" opacity="0.18" />
                  <circle cx="400" cy="400" r="345" stroke="#A95840" strokeWidth="1.4" strokeDasharray="10 10" opacity="0.24" />
                  <circle cx="400" cy="400" r="415" stroke="#FAF8F5" strokeWidth="1.1" strokeDasharray="12 12" opacity="0.14" />
                  <circle cx="400" cy="400" r="495" stroke="#FAF8F5" strokeWidth="1" strokeDasharray="14 14" opacity="0.09" />

                  {/* Directional crosshair axes */}
                  <line x1="50" y1="400" x2="750" y2="400" stroke="#FAF8F5" strokeWidth="1" strokeDasharray="4 8" opacity="0.2" />
                  <line x1="400" y1="50" x2="400" y2="750" stroke="#FAF8F5" strokeWidth="1" strokeDasharray="4 8" opacity="0.2" />
                  <line x1="150" y1="150" x2="650" y2="650" stroke="#FAF8F5" strokeWidth="1" strokeDasharray="3 9" opacity="0.12" />
                  <line x1="150" y1="650" x2="650" y2="150" stroke="#FAF8F5" strokeWidth="1" strokeDasharray="3 9" opacity="0.12" />

                  {/* Terracotta coordinate accent points */}
                  <circle cx="530" cy="270" r="5" fill="#A95840" opacity="0.85" />
                  <circle cx="270" cy="530" r="4" fill="#A95840" opacity="0.7" />
                </svg>
              </div>

              {/* Luminous aura behind portrait */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-[#A95840]/30 via-white/10 to-[#FAF8F5]/20 blur-xs" />

              {/* Portrait Container */}
              <div className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center ring-4 ring-white/15">
                {mentor.portraitPath ? (
                  <Image
                    src={mentor.portraitPath}
                    alt="Amanda Sandoval - Mentora do Rumo Works"
                    width={360}
                    height={360}
                    className="w-full h-full object-cover object-[50%_41%] rounded-full scale-105"
                    priority
                  />
                ) : (
                  // Editorial Fallback Avatar
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-ivory-100 via-sage-50 to-sage-100/60 text-charcoal-400 p-6 text-center select-none">
                    <div className="w-16 h-16 rounded-full bg-sage-700 text-ivory-50 flex items-center justify-center font-serif text-2xl font-semibold shadow-sm mb-2">
                      AS
                    </div>
                    <span className="font-serif text-base font-semibold text-charcoal-500">
                      Amanda
                    </span>
                    <span className="text-[11px] text-sage-800 font-medium tracking-tight">
                      Mentora e Fundadora
                    </span>
                  </div>
                )}
              </div>

              {/* Official LinkedIn logo badge on portrait corner */}
              <div className="absolute bottom-2 right-2">
                <LinkedInLink variant="badge" />
              </div>
            </div>

            {/* Credential pill below portrait */}
            <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs text-xs text-[#E4EBE6] shadow-xs">
              <UserCheck className="w-4 h-4 text-[#E58B70]" />
              <span>Mais de uma década de vivência corporativa</span>
            </div>
          </div>

          {/* Editorial Copy Column */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block mb-4 backdrop-blur-xs">
              Quem está por trás
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#FAF8F5] tracking-tight leading-tight mb-6">
              {mentor.greeting}
            </h2>

            {/* Narrative paragraphs with high contrast and editorial readability */}
            <div className="space-y-4 text-[#E2EBE5] text-sm sm:text-base leading-relaxed mb-8">
              {mentor.bioParagraphs.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>

            {/* Official Clickable LinkedIn Action */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-4 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-xs text-[#D3DFD6]">Conecte-se ou veja o histórico completo:</span>
                <LinkedInLink variant="button" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
