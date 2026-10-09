'use client';

import React, { useState } from 'react';
import { useI18n } from '@/i18n/LanguageContext';
import {
  Award,
  TrendingUp,
  Target,
  RefreshCw,
  Compass,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const LEVEL_OPTIONS = [
  {
    code: 'L4',
    name: 'L4 — Mid-Level',
    scope: 'Autonomous feature delivery, strong craft execution within team scope.',
  },
  {
    code: 'L5',
    name: 'L5 — Senior',
    scope: 'End-to-end domain ownership, handles ambiguity, mentors engineers.',
  },
  {
    code: 'L6',
    name: 'L6 — Staff / Lead',
    scope: 'Multi-team alignment, multi-year roadmap, influences without authority.',
  },
  {
    code: 'L7',
    name: 'L7 — Principal / Director',
    scope: 'Company-wide strategic architecture, P&L ownership, executive alignment.',
  },
];

const MARKET_OPTIONS = [
  { code: 'US', name: 'US (Silicon Valley / Remote)', note: 'Emphasis on scale, ARR metrics, and high-growth velocity' },
  { code: 'LATAM', name: 'LATAM (High-Growth / Tech Hubs)', note: 'Focus on 0-to-1 buildout, team expansion, and financial ROI' },
  { code: 'Europe', name: 'Europe (Tier-1 Tech & Scaleups)', note: 'Rigorous compliance, multi-region governance, and architecture' },
];

export default function LevelCalibrationPage() {
  const { t, language } = useI18n();

  const [targetLevel, setTargetLevel] = useState('L6');
  const [market, setMarket] = useState('US');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const res = await fetch('/api/level-calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLevel,
          market,
          language,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.calibration);
      }
    } catch (err) {
      console.error('Error running calibration:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/60">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {t('levelCalibration.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          {t('levelCalibration.subtitle')}
        </p>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleRunCalibration} className="clean-card p-6 sm:p-8 bg-white space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
            {t('levelCalibration.selectLevel')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {LEVEL_OPTIONS.map((lvl) => {
              const isSelected = targetLevel === lvl.code;
              return (
                <button
                  key={lvl.code}
                  type="button"
                  onClick={() => setTargetLevel(lvl.code)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-purple-50/70 border-brand-400 ring-1 ring-brand-300'
                      : 'bg-slate-50/50 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{lvl.name}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-brand-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {lvl.scope}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
            {t('levelCalibration.selectMarket')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {MARKET_OPTIONS.map((m) => {
              const isSelected = market === m.code;
              return (
                <button
                  key={m.code}
                  type="button"
                  onClick={() => setMarket(m.code)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-purple-50/70 border-brand-400 ring-1 ring-brand-300'
                      : 'bg-slate-50/50 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 mb-0.5">{m.name}</div>
                  <p className="text-[11px] text-slate-500">{m.note}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={analyzing}
            className="px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t('levelCalibration.analyzing')}</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t('levelCalibration.analyzeAction')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Display */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Calibrated Score Card */}
          <div className="clean-card p-6 sm:p-8 bg-white space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  Seniority Scope Calibration
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {result.calibratedLevel}
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 max-w-xl leading-relaxed">
                  {result.summary}
                </p>
              </div>

              <div className="shrink-0 flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="text-center">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {result.fitScore}%
                  </span>
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    {t('levelCalibration.fitScore')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Pillars Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.pillars?.map((p: any, idx: number) => (
              <div key={idx} className="clean-card p-5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{p.name}</span>
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                    {p.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full"
                    style={{ width: `${p.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 pt-1">{p.signal}</p>
                <p className="text-[11px] text-slate-700 font-medium">{p.gapOrStrength}</p>
              </div>
            ))}
          </div>

          {/* Actionable Recommendations to Elevate */}
          <div className="clean-card p-6 sm:p-7 bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>{t('levelCalibration.adviceTitle')}</span>
            </h3>

            <div className="space-y-2.5">
              {result.recommendations?.map((rec: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/60 text-xs text-slate-800 flex items-start space-x-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
