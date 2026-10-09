'use client';

import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { LinkedInLink } from '@/components/brand/LinkedInLink';
import { UserCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { mentor } = siteConfig;

  return (
    <section id="sobre" className="py-20 md:py-28 bg-[#F6F3EE] border-y border-borderWarm scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Portrait Column */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-start lg:items-center">
            <div className="relative group">
              {/* Outer decorative ring */}
              <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-sage-200 via-ivory-200 to-terracotta-100 opacity-70 blur-xs" />

              {/* Portrait Container */}
              <div className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-full overflow-hidden border-3 border-white shadow-xl bg-white flex items-center justify-center">
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
                  // Refined Editorial Fallback Avatar
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-ivory-100 via-sage-50 to-sage-100/60 text-charcoal-400 p-6 text-center select-none">
                    <div className="w-16 h-16 rounded-full bg-sage-700 text-ivory-50 flex items-center justify-center font-serif text-2xl font-semibold shadow-sm mb-2">
                      AS
                    </div>
                    <span className="font-serif text-base font-semibold text-charcoal-500">
                      Amanda
                    </span>
                    <span className="text-[11px] text-sage-800 font-medium tracking-tight">
                      Mentora & Fundadora
                    </span>
                  </div>
                )}
              </div>

              {/* Official LinkedIn logo badge on portrait corner */}
              <div className="absolute bottom-2 right-2">
                <LinkedInLink variant="badge" />
              </div>
            </div>

            {/* Quick credentials badge below portrait */}
            <div className="mt-6 flex items-center gap-2 text-xs text-charcoal-200">
              <UserCheck className="w-4 h-4 text-sage-700" />
              <span>10+ anos de experiência no mercado tech e digital</span>
            </div>
          </div>

          {/* Copy Column */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-sage-800 bg-sage-100/80 px-3 py-1 rounded-full border border-sage-200/60 inline-block mb-4">
              Quem está por trás
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-6">
              {mentor.greeting}
            </h2>

            {/* Verified narrative paragraphs */}
            <div className="space-y-4 text-charcoal-200 text-sm sm:text-base leading-relaxed mb-8">
              {mentor.bioParagraphs.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>

            {/* Official Clickable LinkedIn Action */}
            <div className="pt-6 border-t border-borderWarm/80 flex flex-wrap items-center gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-xs text-charcoal-200">Conecte-se ou veja o histórico completo:</span>
                <LinkedInLink variant="button" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
