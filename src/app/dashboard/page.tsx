'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/LanguageContext';
import {
  FolderGit2,
  FileText,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Award,
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/career-source')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalMetrics = data?.experiences?.reduce(
    (acc: number, exp: any) =>
      acc + (exp.accomplishments?.filter((a: any) => a.quantifiedMetric)?.length || 0),
    0
  ) || 0;

  return (
    <div className="space-y-8">
      {/* Top Welcome Header - Clean & Airy */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t('dashboard.welcome')}, {data?.user?.name ? data.user.name.split(' ')[0] : 'Amanda'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/career-source"
            className="px-3.5 py-2 text-xs font-semibold rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all flex items-center space-x-1.5"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('nav.careerSource')}</span>
          </Link>
          <Link
            href="/cv-lab"
            className="px-4 py-2 text-xs font-semibold rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all flex items-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('dashboard.launchCvLab')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards — Minimalist Google Think aesthetic with friendly subtle color accents */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Health with Green accent */}
        <div className="clean-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('dashboard.sourceHealth')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">96%</span>
            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              Ready
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[96%] rounded-full" />
          </div>
        </div>

        {/* Card 2: Metrics with Violet / Purple accent */}
        <div className="clean-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('dashboard.metricsCount')}</span>
            <span className="w-2 h-2 rounded-full bg-brand-500" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalMetrics}</span>
            <span className="text-[11px] text-brand-700 font-semibold bg-brand-50 px-2 py-0.5 rounded-full">
              Metrics
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Verified results</p>
        </div>

        {/* Card 3: Roles with Slate accent */}
        <div className="clean-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('dashboard.rolesCount')}</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {data?.experiences?.length || 2}
            </span>
            <span className="text-[11px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
              Roles
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Documented career timeline</p>
        </div>

        {/* Card 4: Story Cards with Warm Yellow accent */}
        <div className="clean-card p-5 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t('dashboard.storiesCount')}</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">3</span>
            <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
              STAR
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Interview stories ready</p>
        </div>
      </div>

      {/* Main Action Banner: Clean White with Soft Purple border & Warm Yellow touch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 clean-card p-7 sm:p-8 bg-white relative overflow-hidden border-brand-200/80 shadow-sm flex flex-col justify-between">
          <div className="max-w-lg">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Personalized CV Matching</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {t('dashboard.cvLabCtaTitle')}
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {t('dashboard.cvLabCtaDesc')}
            </p>
          </div>

          <div className="mt-6 flex items-center space-x-3">
            <Link
              href="/cv-lab"
              className="px-5 py-2.5 text-xs font-bold rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>{t('dashboard.launchCvLab')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/career-source"
              className="px-4 py-2.5 text-xs font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {t('nav.careerSource')}
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Recent Targets */}
        <div className="clean-card p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                {t('dashboard.recentTargets')}
              </h3>
              <Target className="w-4 h-4 text-slate-400" />
            </div>

            {data?.recentTargets && data.recentTargets.length > 0 ? (
              <div className="space-y-2.5">
                {data.recentTargets.slice(0, 3).map((target: any) => (
                  <div
                    key={target.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{target.company}</div>
                      <div className="text-slate-500 text-[11px]">{target.roleTitle}</div>
                    </div>
                    {target.latestScore && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-brand-700 border border-slate-200 shadow-2xs">
                        {target.latestScore}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">{t('dashboard.noTargetsYet')}</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Languages:</span>
            <span className="font-semibold text-slate-700">EN • PT • ES</span>
          </div>
        </div>
      </div>

      {/* Platform Modules Overview */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            {t('dashboard.phaseRoadmap')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/story-lab" className="clean-card p-5 bg-white hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                Ativo
              </span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-2">
              {t('roadmap.storyLabTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {t('roadmap.storyLabDesc')}
            </p>
          </Link>

          <Link href="/interview-lab" className="clean-card p-5 bg-white hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Ativo
              </span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-2">
              {t('roadmap.interviewLabTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {t('roadmap.interviewLabDesc')}
            </p>
          </Link>

          <Link href="/application-pack" className="clean-card p-5 bg-white hover:border-brand-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                Ativo
              </span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-2">
              {t('roadmap.appPackTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {t('roadmap.appPackDesc')}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
