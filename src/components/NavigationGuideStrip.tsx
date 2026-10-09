'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/LanguageContext';
import {
  FolderGit2,
  FileText,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Compass,
  MessageSquare,
  DollarSign,
} from 'lucide-react';

export const NavigationGuideStrip = () => {
  const { t } = useI18n();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('career_lab_nav_guide_open');
    if (saved !== null) {
      setIsExpanded(saved === 'true');
    }
  }, []);

  const toggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    localStorage.setItem('career_lab_nav_guide_open', String(next));
  };

  const isStep1 = pathname === '/career-source';
  const isStep2 = pathname === '/cv-lab';
  const isStep3 = pathname === '/story-lab';
  const isStep4 = pathname === '/level-calibration';
  const isStep5 = pathname === '/interview-lab';
  const isStep6 = pathname === '/offer-negotiator';

  return (
    <div className="mb-6 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs transition-all">
      {/* Top Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-purple-50 text-brand-600 flex items-center justify-center">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800">
            {t('navGuide.title')}
          </span>
          <span className="text-slate-400 text-xs hidden sm:inline">•</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {t('navGuide.subtitle')}
          </span>
        </div>

        <button
          type="button"
          onClick={toggle}
          className="text-xs font-medium text-slate-400 hover:text-brand-700 flex items-center space-x-1 px-2.5 py-1 rounded-full hover:bg-slate-50 transition-colors"
        >
          <span>{isExpanded ? t('navGuide.toggleClose') : t('navGuide.toggleOpen')}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded 6-step Journey */}
      {isExpanded && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Step 1: Career Source */}
          <Link
            href="/career-source"
            className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
              isStep1
                ? 'bg-purple-50/50 border-brand-300 ring-1 ring-brand-200'
                : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <FolderGit2 className={`w-3.5 h-3.5 ${isStep1 ? 'text-brand-600' : 'text-slate-500'}`} />
                  <span>{t('navGuide.step1Title')}</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {t('navGuide.step1Tag')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t('navGuide.step1Desc')}
              </p>
            </div>
            <div className="mt-2.5 flex items-center text-[11px] font-semibold text-brand-600 space-x-1">
              <span>{isStep1 ? 'Você está aqui' : 'Abrir base'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          {/* Step 2: CV Lab */}
          <Link
            href="/cv-lab"
            className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
              isStep2
                ? 'bg-purple-50/50 border-brand-300 ring-1 ring-brand-200'
                : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <FileText className={`w-3.5 h-3.5 ${isStep2 ? 'text-brand-600' : 'text-slate-500'}`} />
                  <span>{t('navGuide.step2Title')}</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {t('navGuide.step2Tag')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t('navGuide.step2Desc')}
              </p>
            </div>
            <div className="mt-2.5 flex items-center text-[11px] font-semibold text-brand-600 space-x-1">
              <span>{isStep2 ? 'Você está aqui' : 'Abrir CV Lab'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          {/* Step 3: Story Lab */}
          <Link
            href="/story-lab"
            className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
              isStep3
                ? 'bg-purple-50/50 border-brand-300 ring-1 ring-brand-200'
                : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${isStep3 ? 'text-brand-600' : 'text-amber-500'}`} />
                  <span>{t('navGuide.step3Title')}</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {t('navGuide.step3Tag')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t('navGuide.step3Desc')}
              </p>
            </div>
            <div className="mt-2.5 flex items-center text-[11px] font-semibold text-brand-600 space-x-1">
              <span>{isStep3 ? 'Você está aqui' : 'Criar Histórias'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          {/* Step 4: Level Calibration */}
          <Link
            href="/level-calibration"
            className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
              isStep4
                ? 'bg-purple-50/50 border-brand-300 ring-1 ring-brand-200'
                : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <TrendingUp className={`w-3.5 h-3.5 ${isStep4 ? 'text-brand-600' : 'text-emerald-500'}`} />
                  <span>{t('navGuide.step4Title')}</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {t('navGuide.step4Tag')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t('navGuide.step4Desc')}
              </p>
            </div>
            <div className="mt-2.5 flex items-center text-[11px] font-semibold text-brand-600 space-x-1">
              <span>{isStep4 ? 'Você está aqui' : 'Calibrar Nível'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          {/* Step 5: Interview Lab */}
          <Link
            href="/interview-lab"
            className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
              isStep5
                ? 'bg-purple-50/50 border-brand-300 ring-1 ring-brand-200'
                : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <MessageSquare className={`w-3.5 h-3.5 ${isStep5 ? 'text-brand-600' : 'text-sky-500'}`} />
                  <span>{t('navGuide.step5Title')}</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {t('navGuide.step5Tag')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t('navGuide.step5Desc')}
              </p>
            </div>
            <div className="mt-2.5 flex items-center text-[11px] font-semibold text-brand-600 space-x-1">
              <span>{isStep5 ? 'Você está aqui' : 'Simular'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          {/* Step 6: Offer Negotiator */}
          <Link
            href="/offer-negotiator"
            className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
              isStep6
                ? 'bg-purple-50/50 border-brand-300 ring-1 ring-brand-200'
                : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <DollarSign className={`w-3.5 h-3.5 ${isStep6 ? 'text-brand-600' : 'text-emerald-600'}`} />
                  <span>{t('navGuide.step6Title')}</span>
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {t('navGuide.step6Tag')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t('navGuide.step6Desc')}
              </p>
            </div>
            <div className="mt-2.5 flex items-center text-[11px] font-semibold text-brand-600 space-x-1">
              <span>{isStep6 ? 'Você está aqui' : 'Negociar'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
