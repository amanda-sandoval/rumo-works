'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/LanguageContext';
import { NavigationGuideStrip } from '@/components/NavigationGuideStrip';
import {
  DollarSign,
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  Briefcase,
  Layers,
  ArrowUpRight,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  COMP_BENCHMARKS,
  CounterOfferSimulationResult,
} from '@/lib/ai/negotiationEngine';

export default function OfferNegotiatorPage() {
  const { t, language } = useI18n();

  // Settings
  const [market, setMarket] = useState<'US' | 'LATAM' | 'Europe'>('US');
  const [level, setLevel] = useState<'L4' | 'L5' | 'L6' | 'L7'>('L6');
  const [company, setCompany] = useState('Stripe');
  const [roleTitle, setRoleTitle] = useState('Staff Product Manager');

  // Initial offer numbers
  const [baseSalary, setBaseSalary] = useState(235000);
  const [equity, setEquity] = useState(180000);
  const [signOn, setSignOn] = useState(30000);
  const [bonus, setBonus] = useState(47000);

  // Strategy
  const [strategy, setStrategy] = useState<
    'competing_offer' | 'unvested_cliff' | 'level_elevation' | 'accelerated_review'
  >('competing_offer');
  const [candidateNotes, setCandidateNotes] = useState('');

  // Simulation results
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<CounterOfferSimulationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Update initial offer presets when market or level changes
  useEffect(() => {
    const b = COMP_BENCHMARKS[market]?.[level] || COMP_BENCHMARKS.US.L6;
    setBaseSalary(b.baseMid);
    setEquity(b.equityMid);
    setSignOn(b.signOnTypical);
    setBonus(Math.round(b.baseMid * (b.bonusPercent / 100)));
    setResult(null);
  }, [market, level]);

  const benchmarks = COMP_BENCHMARKS[market]?.[level] || COMP_BENCHMARKS.US.L6;
  const currentTotal = baseSalary + equity + signOn + bonus;
  const currencySymbol = benchmarks.currency === 'USD' ? '$' : '€';

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/offer-negotiator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          roleTitle,
          market,
          level,
          currentOffer: {
            base: Number(baseSalary),
            equity: Number(equity),
            signOn: Number(signOn),
            bonus: Number(bonus),
          },
          strategy,
          candidateNotes,
          language,
        }),
      });
      const data = await res.json();
      if (data.simulation) {
        setResult(data.simulation);
      }
    } catch (err) {
      console.error('Failed to simulate negotiation:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const strategies = [
    {
      id: 'competing_offer' as const,
      title: t('offerNegotiator.strategyCompeting'),
      desc: 'Use uma oferta paralela mais alta como alavanca de equity e sign-on.',
    },
    {
      id: 'unvested_cliff' as const,
      title: t('offerNegotiator.strategyCliff'),
      desc: 'Peça sign-on adicional para compensar ações deixadas na mesa na empresa atual.',
    },
    {
      id: 'level_elevation' as const,
      title: t('offerNegotiator.strategyLevel'),
      desc: 'Argumente que o escopo discutido nas entrevistas se encaixa no quartil superior da faixa.',
    },
    {
      id: 'accelerated_review' as const,
      title: t('offerNegotiator.strategyPerformance'),
      desc: 'Negocie revisão antecipada de equity após 6 meses atrelada a metas claras.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <NavigationGuideStrip />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1.5">
            <DollarSign className="w-4 h-4 text-brand-500" />
            <span>{t('offerNegotiator.title')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('offerNegotiator.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {t('offerNegotiator.subtitle')}
          </p>
        </div>

        {/* Top Controls: Market & Level Selection */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('offerNegotiator.selectMarket')}
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                {(['US', 'LATAM', 'Europe'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarket(m)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      market === m ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('offerNegotiator.selectLevel')}
              </label>
              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                {(['L4', 'L5', 'L6', 'L7'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      level === lvl ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Empresa
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cargo Alvo
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Benchmarks Banner */}
        <div className="bg-gradient-to-r from-purple-50/60 via-amber-50/40 to-white border border-brand-200/60 rounded-2xl p-4 sm:p-5 shadow-2xs mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-slate-800">
              {t('offerNegotiator.benchmarkTitle')} — {market} ({level})
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-500 block">Salário Base</span>
              <span className="font-bold text-slate-800 text-sm">
                {currencySymbol}{benchmarks.baseMin.toLocaleString()} - {currencySymbol}{benchmarks.baseMax.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-500 block">Ações / RSUs (Anual)</span>
              <span className="font-bold text-slate-800 text-sm">
                {currencySymbol}{benchmarks.equityMin.toLocaleString()} - {currencySymbol}{benchmarks.equityMax.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-500 block">Sign-on Típico</span>
              <span className="font-bold text-slate-800 text-sm">
                {currencySymbol}{benchmarks.signOnTypical.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-500 block">Bônus Anual Alvo</span>
              <span className="font-bold text-slate-800 text-sm">
                {benchmarks.bonusPercent}% do Base
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid: Offer Setup & Strategy vs. Recruiter Response */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Current Offer & Strategy */}
          <div className="space-y-5">
            {/* Offer Component Inputs */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-4">
                <Briefcase className="w-4 h-4 text-brand-600" />
                <span>{t('offerNegotiator.currentOffer')}</span>
              </span>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('offerNegotiator.baseSalary')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(Number(e.target.value))}
                      className="w-full text-xs pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('offerNegotiator.equity')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={equity}
                      onChange={(e) => setEquity(Number(e.target.value))}
                      className="w-full text-xs pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('offerNegotiator.signOn')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={signOn}
                      onChange={(e) => setSignOn(Number(e.target.value))}
                      className="w-full text-xs pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t('offerNegotiator.annualBonus')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={bonus}
                      onChange={(e) => setBonus(Number(e.target.value))}
                      className="w-full text-xs pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Total Comp Highlight */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  {t('offerNegotiator.totalComp')}
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {currencySymbol}{currentTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Counter Strategy Chips */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-3">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>{t('offerNegotiator.selectStrategy')}</span>
              </span>

              <div className="space-y-2 mb-4">
                {strategies.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStrategy(s.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      strategy === s.id
                        ? 'bg-purple-50/60 border-brand-300 ring-1 ring-brand-200'
                        : 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-800">{s.title}</span>
                      {strategy === s.id && (
                        <Check className="w-3.5 h-3.5 text-brand-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{s.desc}</p>
                  </button>
                ))}
              </div>

              {/* Custom constraint note */}
              <textarea
                rows={2}
                value={candidateNotes}
                onChange={(e) => setCandidateNotes(e.target.value)}
                placeholder={t('offerNegotiator.customNote')}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 mb-3 focus:outline-hidden focus:ring-2 focus:ring-brand-500 resize-none"
              />

              <button
                type="button"
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                {isSimulating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isSimulating ? t('offerNegotiator.simulating') : t('offerNegotiator.simulateCounter')}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Negotiation Outcome & Scripts */}
          <div className="space-y-5">
            {result ? (
              <>
                {/* Revised Compensation & Financial Delta */}
                <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>{t('offerNegotiator.revisedOffer')}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200 flex items-center space-x-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+{result.deltaGained.percentIncrease}%</span>
                    </span>
                  </div>

                  {/* Financial Delta Callout */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border border-emerald-200/60 mb-4 text-center">
                    <span className="text-[11px] font-semibold text-emerald-800 block">
                      {t('offerNegotiator.deltaGained')}
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-700 tracking-tight">
                      +{currencySymbol}{result.deltaGained.year1TotalIncrease.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-emerald-600 block mt-0.5">
                      (Ano 1: Salário + Equity + Sign-on adicional)
                    </span>
                  </div>

                  {/* Revised Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 block">Salário Base</span>
                      <span className="font-bold text-slate-800">
                        {currencySymbol}{result.revisedOffer.base.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 block">Ações / RSUs</span>
                      <span className="font-bold text-emerald-700">
                        {currencySymbol}{result.revisedOffer.equity.toLocaleString()}/ano
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 block">Sign-on Bonus</span>
                      <span className="font-bold text-emerald-700">
                        {currencySymbol}{result.revisedOffer.signOn.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] text-slate-500 block">Remuneração Total</span>
                      <span className="font-bold text-slate-900">
                        {currencySymbol}{result.revisedOffer.totalComp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recruiter Response */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 mb-2">
                    <MessageSquare className="w-4 h-4 text-brand-600" />
                    <span>{t('offerNegotiator.recruiterResponse')}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
                    &ldquo;{result.recruiterResponseText}&rdquo;
                  </p>
                </div>

                {/* Negotiation Script */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{t('offerNegotiator.scriptTitle')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.scripts.emailBody, 'script')}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                    >
                      {copiedKey === 'script' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'script' ? t('common.copied') : t('offerNegotiator.copyScript')}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    {t('offerNegotiator.scriptSubtitle')}
                  </p>

                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {result.scripts.emailBody}
                  </div>

                  {/* Phone talking points */}
                  {result.scripts.phoneTalkingPoints.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                        Pontos Chave para Chamada Telefônica:
                      </span>
                      <ul className="space-y-1">
                        {result.scripts.phoneTalkingPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="text-[11px] text-slate-600 flex items-start space-x-1.5">
                            <span className="text-brand-600 font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-500">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-brand-600 mx-auto flex items-center justify-center mb-3">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 mb-1">
                  Simule sua Alavancagem Salarial
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Ajuste os valores da proposta recebida à esquerda, escolha a estratégia que melhor reflete sua situação e clique em &ldquo;{t('offerNegotiator.simulateCounter')}&rdquo; para obter a contraproposta estimada e o roteiro exato de negociação.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
