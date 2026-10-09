'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Compass,
  FolderGit2,
  FileText,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Briefcase,
  DollarSign,
} from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const { t } = useI18n();

  const navLinks = [
    {
      href: '/dashboard',
      label: t('nav.dashboard'),
      tooltip: t('dashboard.subtitle'),
      icon: Compass,
    },
    {
      href: '/career-source',
      label: t('nav.careerSource'),
      tooltip: t('navGuide.step1Desc'),
      icon: FolderGit2,
    },
    {
      href: '/cv-lab',
      label: t('nav.cvLab'),
      tooltip: t('navGuide.step2Desc'),
      icon: FileText,
    },
    {
      href: '/story-lab',
      label: t('nav.storyLab'),
      tooltip: t('navGuide.step3Desc'),
      icon: Sparkles,
    },
    {
      href: '/level-calibration',
      label: t('nav.levelCalibration'),
      tooltip: t('navGuide.step4Desc'),
      icon: TrendingUp,
    },
    {
      href: '/interview-lab',
      label: t('nav.interviewLab'),
      tooltip: t('interviewLab.subtitle'),
      icon: MessageSquare,
    },
    {
      href: '/application-pack',
      label: t('nav.appPack'),
      tooltip: t('applicationPack.subtitle'),
      icon: Briefcase,
    },
    {
      href: '/offer-negotiator',
      label: t('nav.offerNegotiator'),
      tooltip: t('offerNegotiator.subtitle'),
      icon: DollarSign,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-extrabold tracking-tight text-slate-900">
              The Career Lab
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
        </Link>

        {/* Navigation items with tooltips */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.tooltip}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side controls: Language Switcher & Avatar */}
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200 text-xs">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-100 to-purple-100 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-200/50">
              AS
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
