'use client';

import React from 'react';
import { useI18n } from '@/i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/i18n/config';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center space-x-1 bg-slate-100/90 border border-slate-200/80 rounded-full p-1">
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all flex items-center space-x-1 ${
              isActive
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200/70 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
            title={lang.nativeName}
          >
            <span>{lang.flag}</span>
            <span>{lang.code.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
};
