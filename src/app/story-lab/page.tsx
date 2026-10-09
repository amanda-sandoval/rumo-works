'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/i18n/config';
import {
  Sparkles,
  Copy,
  Check,
  Clock,
  Award,
  Layers,
  Trash2,
  RefreshCw,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

const QUICK_STARTERS = [
  {
    title: 'Payment Gateway Outage',
    text: 'During our Black Friday traffic surge, the third-party payment gateway began throwing 500 errors. I mobilized our backend on-call, designed an automatic fallback to our secondary processor, and saved $850k in transactions with zero data loss.',
  },
  {
    title: 'Cross-Team Roadmap Alignment',
    text: 'Engineering wanted a full rewrite of our data pipeline while Marketing needed customer-facing dashboard features immediately. I facilitated technical mediation, designed an incremental strangler-fig migration, and aligned both Director stakeholders in 3 weeks.',
  },
  {
    title: '0-to-1 Enterprise Product Launch',
    text: 'Identified that enterprise clients were dropping out of our self-serve funnel due to single-sign-on requirements. I drafted the PRD, led a team of 4 engineers, and launched SAML/SSO support in 60 days, generating $2.4M in new enterprise ARR.',
  },
  {
    title: 'Reducing Latency Under 10x Load',
    text: 'Our core search API latency degraded to 1.8 seconds during peak hours. I profiled query bottlenecks, introduced multi-layer Redis caching with write-through invalidation, and reduced p99 latency to 180ms.',
  },
];

export default function StoryLabPage() {
  const { t, language } = useI18n();

  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState(QUICK_STARTERS[0].text);
  const [targetLang, setTargetLang] = useState<SupportedLanguage>(language);

  const [converting, setConverting] = useState(false);
  const [currentStory, setCurrentStory] = useState<any>(null);
  const [activeVersionTab, setActiveVersionTab] = useState<'30s' | '90s' | 'deep'>('90s');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const [savedStories, setSavedStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

  const loadSavedStories = () => {
    fetch('/api/story-lab')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSavedStories(data.storyCards || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingStories(false));
  };

  useEffect(() => {
    loadSavedStories();
  }, []);

  const handleApplyStarter = (starter: { title: string; text: string }) => {
    setTitle(starter.title);
    setRawText(starter.text);
  };

  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setConverting(true);
    try {
      const res = await fetch('/api/story-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Strategic Career Story',
          rawText,
          language: targetLang,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentStory(data.storyCard);
        loadSavedStories();
      }
    } catch (err) {
      console.error('Error generating story:', err);
    } finally {
      setConverting(false);
    }
  };

  const handleCopy = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const handleDeleteStory = async (id: string) => {
    try {
      await fetch(`/api/story-lab?id=${id}`, { method: 'DELETE' });
      loadSavedStories();
      if (currentStory?.id === id) {
        setCurrentStory(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200/60">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {t('storyLab.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          {t('storyLab.subtitle')}
        </p>
      </div>

      {/* Generator Form Card */}
      <form onSubmit={handleGenerateStory} className="clean-card p-6 sm:p-8 bg-white space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
            {t('storyLab.inputTitle')}
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            {t('storyLab.inputDesc')}
          </p>

          {/* Quick starters chips */}
          <div className="mb-3">
            <span className="text-[11px] text-slate-400 block mb-1.5">
              {t('storyLab.quickStarters')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_STARTERS.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => handleApplyStarter(s)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 transition-colors border border-transparent hover:border-brand-200"
                >
                  + {s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Story Title / Context
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scaling Core Platform Under 10x Load"
                className="w-full px-3.5 py-2 rounded-xl clean-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Story Language
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as SupportedLanguage)}
                className="w-full px-3.5 py-2 rounded-xl clean-input text-xs"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            rows={4}
            required
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={t('storyLab.placeholder')}
            className="w-full px-4 py-3 rounded-2xl clean-input text-xs leading-relaxed"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={converting || !rawText.trim()}
            className="px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {converting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t('storyLab.converting')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('storyLab.convertAction')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Story Card Result */}
      {currentStory && (
        <div className="clean-card p-6 sm:p-8 bg-white border-brand-200/80 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                STAR Story Card
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1.5">
                {currentStory.title}
              </h2>
            </div>
          </div>

          {/* S.T.A.R. Breakdown Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <span className="font-bold text-slate-800 block mb-1">
                {t('storyLab.challenge')}
              </span>
              <p className="text-slate-600 leading-relaxed">{currentStory.challenge}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-100 text-xs">
              <span className="font-bold text-brand-800 block mb-1">
                {t('storyLab.action')}
              </span>
              <p className="text-slate-600 leading-relaxed">{currentStory.action}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-100 text-xs">
              <span className="font-bold text-amber-900 block mb-1">
                {t('storyLab.impact')}
              </span>
              <p className="text-slate-600 leading-relaxed">{currentStory.impact}</p>
            </div>
          </div>

          {/* Competencies Tags */}
          {currentStory.competencies && currentStory.competencies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-400 mr-1">Competencies:</span>
              {currentStory.competencies.map((comp: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700"
                >
                  {comp}
                </span>
              ))}
            </div>
          )}

          {/* 3 Speaking Lengths Interactive Tabs */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-full text-xs">
                <button
                  type="button"
                  onClick={() => setActiveVersionTab('30s')}
                  className={`px-3 py-1 rounded-full font-bold transition-all flex items-center space-x-1.5 ${
                    activeVersionTab === '30s'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Clock className="w-3 h-3 text-brand-600" />
                  <span>30s Elevator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVersionTab('90s')}
                  className={`px-3 py-1 rounded-full font-bold transition-all flex items-center space-x-1.5 ${
                    activeVersionTab === '90s'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>90s Standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVersionTab('deep')}
                  className={`px-3 py-1 rounded-full font-bold transition-all flex items-center space-x-1.5 ${
                    activeVersionTab === 'deep'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-3 h-3 text-purple-600" />
                  <span>2–3 Min Deep Dive</span>
                </button>
              </div>

              {/* Copy button */}
              <button
                type="button"
                onClick={() => {
                  const txt =
                    activeVersionTab === '30s'
                      ? currentStory.version30s
                      : activeVersionTab === '90s'
                      ? currentStory.version90s
                      : currentStory.versionDeepDive;
                  handleCopy(txt, activeVersionTab);
                }}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1"
              >
                {copiedTab === activeVersionTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('storyLab.copyStory')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Speaking text box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
              {activeVersionTab === '30s' && currentStory.version30s}
              {activeVersionTab === '90s' && currentStory.version90s}
              {activeVersionTab === 'deep' && currentStory.versionDeepDive}
            </div>
          </div>
        </div>
      )}

      {/* Saved Stories Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-brand-600" />
          <span>{t('storyLab.savedCards')}</span>
          <span className="text-xs text-slate-400 font-normal">
            ({savedStories.length})
          </span>
        </h3>

        {savedStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedStories.map((story) => (
              <div
                key={story.id}
                className="clean-card p-5 bg-white flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {story.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleDeleteStory(story.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Excluir história"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {story.version90s}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400 font-mono">
                    {story.language.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStory(story)}
                    className="text-brand-600 font-bold hover:text-brand-700 flex items-center space-x-1"
                  >
                    <span>Abrir Story Card</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="clean-card p-8 bg-white text-center text-xs text-slate-400">
            {t('storyLab.noSavedStories')}
          </div>
        )}
      </div>
    </div>
  );
}
