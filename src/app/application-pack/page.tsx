'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/LanguageContext';
import { NavigationGuideStrip } from '@/components/NavigationGuideStrip';
import {
  Briefcase,
  Copy,
  Check,
  Send,
  Sparkles,
  HelpCircle,
  FileText,
  Mail,
  Linkedin,
  Users,
  RefreshCw,
} from 'lucide-react';
import { ApplicationPackContent } from '@/lib/ai/applicationPackEngine';

export default function ApplicationPackPage() {
  const { t, language } = useI18n();

  const [isLoading, setIsLoading] = useState(false);
  const [pack, setPack] = useState<ApplicationPackContent | null>(null);
  const [company, setCompany] = useState('Stripe');
  const [roleTitle, setRoleTitle] = useState('Staff Product Manager');
  const [targetLevel, setTargetLevel] = useState('L6');
  const [outreachTab, setOutreachTab] = useState<'linkedin' | 'email' | 'referral'>('linkedin');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchPack = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/application-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      const data = await res.json();
      if (data.pack) {
        setPack(data.pack);
        setCompany(data.company || 'Stripe');
        setRoleTitle(data.roleTitle || 'Staff Product Manager');
        setTargetLevel(data.targetLevel || 'L6');
      }
    } catch (err) {
      console.error('Error fetching application pack:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPack();
  }, [language]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <NavigationGuideStrip />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1.5">
              <Briefcase className="w-4 h-4 text-brand-500" />
              <span>{t('applicationPack.title')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('applicationPack.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              {t('applicationPack.subtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPack}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-2xs flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? t('common.loading') : t('applicationPack.generatePack')}</span>
          </button>
        </div>

        {/* Role Target Pill */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-600 flex items-center justify-center font-bold text-sm">
              {targetLevel}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">
                Candidatura Ativa
              </span>
              <h2 className="text-sm font-extrabold text-slate-900">
                {roleTitle} na {company}
              </h2>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Sincronizado com Career Source & Story Lab
          </span>
        </div>

        {pack ? (
          <div className="space-y-6">
            {/* 1. Executive Summary & Why Role Pitch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Executive Overview */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <span>{t('applicationPack.executiveOverview')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(pack.executiveSummary, 'execSummary')}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                  >
                    {copiedKey === 'execSummary' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'execSummary' ? t('common.copied') : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
                  {pack.executiveSummary}
                </p>
              </div>

              {/* Why This Role Pitch */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{t('applicationPack.whyRoleTitle')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(pack.whyThisRolePitch, 'whyRole')}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                  >
                    {copiedKey === 'whyRole' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'whyRole' ? t('common.copied') : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/30 p-3.5 rounded-xl border border-amber-200/60">
                  {pack.whyThisRolePitch}
                </p>
              </div>
            </div>

            {/* 2. Outreach Message Templates (Tabs) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-slate-900">
                    {t('applicationPack.outreachTitle')}
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setOutreachTab('linkedin')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                      outreachTab === 'linkedin'
                        ? 'bg-white text-brand-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
                    <span>{t('applicationPack.linkedinTab')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOutreachTab('email')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                      outreachTab === 'email'
                        ? 'bg-white text-brand-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t('applicationPack.emailTab')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOutreachTab('referral')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                      outreachTab === 'referral'
                        ? 'bg-white text-brand-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('applicationPack.referralTab')}</span>
                  </button>
                </div>
              </div>

              {/* Active Tab Content */}
              {(() => {
                let currentItem = pack.outreachTemplates.linkedinInMail;
                let currentKey = 'linkedin';
                if (outreachTab === 'email') {
                  currentItem = pack.outreachTemplates.coldEmailHiringManager;
                  currentKey = 'email';
                } else if (outreachTab === 'referral') {
                  currentItem = pack.outreachTemplates.warmPeerReferral;
                  currentKey = 'referral';
                }

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60 font-medium text-slate-700">
                      <span>
                        <strong className="text-slate-900">Assunto:</strong> {currentItem.subject}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentItem.subject, `${currentKey}_sub`)}
                        className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1 ml-2"
                      >
                        {copiedKey === `${currentKey}_sub` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === `${currentKey}_sub` ? t('common.copied') : 'Copiar Assunto'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 leading-relaxed">
                        {currentItem.body}
                      </pre>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentItem.body, `${currentKey}_body`)}
                        className="absolute top-3 right-3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-brand-600 hover:text-brand-700 shadow-2xs flex items-center space-x-1.5 transition-all"
                      >
                        {copiedKey === `${currentKey}_body` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === `${currentKey}_body` ? t('common.copied') : t('applicationPack.copyTemplate')}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 3. Strategic Reverse-Interview Questions */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center space-x-2 mb-1.5">
                <HelpCircle className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-900">
                  {t('applicationPack.reverseInterviewTitle')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                {t('applicationPack.reverseInterviewSubtitle')}
              </p>

              <div className="space-y-3">
                {pack.reverseInterviewQuestions.map((qItem, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/60 hover:border-brand-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-brand-700 border border-brand-200/60">
                        {qItem.committeeTarget}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(qItem.question, `q_${qIdx}`)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-brand-700 flex items-center space-x-1"
                      >
                        {copiedKey === `q_${qIdx}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === `q_${qIdx}` ? t('common.copied') : 'Copiar Pergunta'}</span>
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mb-1 leading-relaxed">
                      &ldquo;{qItem.question}&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      <strong className="text-slate-600">Por que perguntar:</strong> {qItem.strategicRationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Preparando Application Pack sob medida...</p>
          </div>
        )}
      </div>
    </div>
  );
}
