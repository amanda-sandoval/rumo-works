'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/LanguageContext';
import {
  FolderGit2,
  Plus,
  Save,
  CheckCircle2,
  Building2,
  Calendar,
  Users,
  Sparkles,
  Briefcase,
  Layers,
  ChevronDown,
} from 'lucide-react';

const PRESET_HEADLINES = [
  'Product Manager | Tech Lead',
  'Senior Software Engineer | Full-Stack',
  'Data Analyst | Machine Learning & BI',
  'Computer Science Student | Aspiring SWE',
  'Engineering Manager | Distributed Systems',
];

const PRESET_ROLES = [
  'Product Manager',
  'Software Engineer',
  'Data Analyst',
  'Tech Lead',
  'UI/UX Designer',
  'Project Manager',
  'Intern / Graduate',
];

const PRESET_METRICS = [
  '+25% Revenue Growth',
  '-40% Latency',
  '-$500k Annual Cost',
  '100k Active Users',
  '6x Deploy Velocity',
  'Top 5% Class Rank',
  '1st Place Hackathon',
];

const PRESET_SKILLS = [
  'Product Strategy',
  'Leadership',
  'Python & SQL',
  'Communication',
  'Agile / Scrum',
  'System Architecture',
  'Data Analysis',
  'Problem Solving',
];

export default function CareerSourcePage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [data, setData] = useState<any>(null);

  // Profile Form State
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [targetMarkets, setTargetMarkets] = useState('');

  // New Accomplishment Form state
  const [activeExpForNewBullet, setActiveExpForNewBullet] = useState<string | null>(null);
  const [bulletText, setBulletText] = useState('');
  const [businessProblem, setBusinessProblem] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [quantifiedMetric, setQuantifiedMetric] = useState('');
  const [competencies, setCompetencies] = useState('');

  // New Role Form state
  const [showAddRole, setShowAddRole] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newTeamScope, setNewTeamScope] = useState('');

  const loadData = () => {
    fetch('/api/career-source')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res);
          setHeadline(res.profile?.headline || '');
          setSummary(res.profile?.summary || '');
          setTargetLevel(res.profile?.targetLevel || '');
          setTargetMarkets(res.profile?.targetMarkets || '');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/career-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update_profile',
          headline,
          summary,
          targetLevel,
          targetMarkets,
          skills: data?.profile?.skills || [],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(t('common.success'));
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAccomplishment = async (expId: string) => {
    if (!bulletText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/career-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'add_accomplishment',
          experienceId: expId,
          text: bulletText,
          businessProblem,
          actionTaken,
          quantifiedMetric,
          competencies,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setBulletText('');
        setBusinessProblem('');
        setActionTaken('');
        setQuantifiedMetric('');
        setCompetencies('');
        setActiveExpForNewBullet(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/career-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'add_experience',
          company: newCompany,
          title: newTitle,
          location: newLocation,
          startDate: newStartDate,
          endDate: newEndDate,
          teamScope: newTeamScope,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNewCompany('');
        setNewTitle('');
        setNewLocation('');
        setNewStartDate('');
        setNewEndDate('');
        setNewTeamScope('');
        setShowAddRole(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header - Clean, Friendly, Uncluttered */}
      <div className="pb-2 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t('careerSource.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {t('careerSource.subtitle')}
          </p>
        </div>
      </div>

      {/* Profile Section - Clean White Card */}
      <div className="clean-card p-6 sm:p-8 bg-white">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t('careerSource.profileSection')}
            </h2>
          </div>
          {successMsg && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{successMsg}</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t('careerSource.headline')}
              </label>
              <span className="text-[11px] text-slate-400">
                {t('common.quickAdd')}
              </span>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {PRESET_HEADLINES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setHeadline(preset)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 transition-colors border border-transparent hover:border-brand-200"
                >
                  + {preset}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={t('careerSource.headlinePlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-xl clean-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('careerSource.targetLevel')}
              </label>
              <input
                type="text"
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                placeholder="e.g., L5 Senior, L6 Staff, or Mid-Level"
                className="w-full px-3.5 py-2.5 rounded-xl clean-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('careerSource.targetMarkets')}
              </label>
              <input
                type="text"
                value={targetMarkets}
                onChange={(e) => setTargetMarkets(e.target.value)}
                placeholder="e.g., US, Remote, LATAM, Europe"
                className="w-full px-3.5 py-2.5 rounded-xl clean-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('careerSource.summary')}
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={t('careerSource.summaryPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-xl clean-input text-xs leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? t('common.saving') : t('common.save')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Experiences & Achievements */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t('careerSource.rolesSection')}
            </h2>
            <p className="text-xs text-slate-500">
              Manage your career timeline and verified accomplishments
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddRole(!showAddRole)}
            className="px-4 py-2 text-xs font-bold rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-brand-600" />
            <span>{t('careerSource.addRole')}</span>
          </button>
        </div>

        {/* Add Role Form (Clean White Box) */}
        {showAddRole && (
          <form
            onSubmit={handleAddRole}
            className="clean-card p-6 bg-white border-brand-200 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <Briefcase className="w-4 h-4 text-brand-600" />
                <span>Add Experience Role</span>
              </h3>
            </div>

            {/* Quick role presets */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">
                {t('common.quickAdd')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setNewTitle(role)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 transition-colors"
                  >
                    + {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t('careerSource.company')} *
                </label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Google, Nubank"
                  className="w-full px-3 py-2 text-xs rounded-xl clean-input"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t('careerSource.roleTitle')} *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Product Manager"
                  className="w-full px-3 py-2 text-xs rounded-xl clean-input"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t('careerSource.startDate')}
                </label>
                <input
                  type="text"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  placeholder="e.g. 2022-01"
                  className="w-full px-3 py-2 text-xs rounded-xl clean-input"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t('careerSource.endDate')}
                </label>
                <input
                  type="text"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  placeholder="e.g. Present"
                  className="w-full px-3 py-2 text-xs rounded-xl clean-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {t('careerSource.teamScope')}
              </label>
              <input
                type="text"
                value={newTeamScope}
                onChange={(e) => setNewTeamScope(e.target.value)}
                placeholder={t('careerSource.teamScopePlaceholder')}
                className="w-full px-3 py-2 text-xs rounded-xl clean-input"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddRole(false)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-brand-600 text-white hover:bg-brand-700"
              >
                {t('careerSource.addRole')}
              </button>
            </div>
          </form>
        )}

        {/* Existing Roles */}
        <div className="space-y-5">
          {data?.experiences?.map((exp: any) => (
            <div key={exp.id} className="clean-card p-6 sm:p-7 bg-white space-y-4">
              {/* Role Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-700 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {exp.title}{' '}
                      <span className="text-slate-500 font-medium">@ {exp.company}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {exp.startDate} — {exp.endDate || 'Present'}
                      </span>
                      {exp.location && <span>• {exp.location}</span>}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveExpForNewBullet(
                      activeExpForNewBullet === exp.id ? null : exp.id
                    )
                  }
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/50 transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('careerSource.addAccomplishment')}</span>
                </button>
              </div>

              {/* Team Scope */}
              {exp.teamScope && (
                <div className="px-3 py-2 rounded-xl bg-slate-50 text-xs text-slate-600 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="font-semibold text-slate-800">Scope:</span>
                  <span>{exp.teamScope}</span>
                </div>
              )}

              {/* Accomplishments list */}
              <div className="space-y-2.5 pt-1">
                {exp.accomplishments?.map((acc: any) => (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-xl bg-[#fafafa] border border-slate-200/70 text-xs space-y-2 hover:bg-white hover:shadow-2xs transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                        <span className="font-medium text-slate-800 leading-relaxed text-xs sm:text-[13px]">
                          {acc.text}
                        </span>
                      </div>
                      {acc.quantifiedMetric && (
                        <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                          {acc.quantifiedMetric}
                        </span>
                      )}
                    </div>

                    {/* Breakdown details */}
                    {(acc.businessProblem || acc.actionTaken || acc.competencies) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-200/50 text-[11px]">
                        {acc.businessProblem && (
                          <div className="text-slate-600">
                            <span className="font-semibold text-slate-800 block">
                              Challenge:
                            </span>
                            <span>{acc.businessProblem}</span>
                          </div>
                        )}
                        {acc.actionTaken && (
                          <div className="text-slate-600">
                            <span className="font-semibold text-brand-700 block">
                              Your Action:
                            </span>
                            <span>{acc.actionTaken}</span>
                          </div>
                        )}
                        {acc.competencies && (
                          <div className="text-slate-600">
                            <span className="font-semibold text-purple-700 block">
                              Skills:
                            </span>
                            <span>{acc.competencies}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Inline Form to Add Accomplishment with Pre-selectable chips */}
              {activeExpForNewBullet === exp.id && (
                <div className="mt-4 p-5 rounded-2xl bg-white border border-brand-200 shadow-sm space-y-4">
                  <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>{t('careerSource.addAccomplishment')}</span>
                    </span>
                  </div>

                  {/* Accomplishment text */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {t('careerSource.bulletText')} *
                    </label>
                    <textarea
                      rows={2}
                      value={bulletText}
                      onChange={(e) => setBulletText(e.target.value)}
                      placeholder={t('careerSource.bulletPlaceholder')}
                      className="w-full px-3 py-2 text-xs rounded-xl clean-input"
                    />
                  </div>

                  {/* Quick Metric Presets */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      {t('common.quickAdd')} (Result & Metric)
                    </span>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {PRESET_METRICS.map((metric) => (
                        <button
                          key={metric}
                          type="button"
                          onClick={() => setQuantifiedMetric(metric)}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 transition-colors"
                        >
                          + {metric}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={quantifiedMetric}
                      onChange={(e) => setQuantifiedMetric(e.target.value)}
                      placeholder={t('careerSource.quantifiedMetricPlaceholder')}
                      className="w-full px-3 py-2 text-xs rounded-xl clean-input"
                    />
                  </div>

                  {/* Quick Skill Presets */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      {t('common.quickAdd')} (Skills)
                    </span>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {PRESET_SKILLS.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() =>
                            setCompetencies((prev) =>
                              prev ? `${prev}, ${skill}` : skill
                            )
                          }
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 transition-colors"
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={competencies}
                      onChange={(e) => setCompetencies(e.target.value)}
                      placeholder={t('careerSource.competenciesPlaceholder')}
                      className="w-full px-3 py-2 text-xs rounded-xl clean-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {t('careerSource.businessProblem')}
                      </label>
                      <input
                        type="text"
                        value={businessProblem}
                        onChange={(e) => setBusinessProblem(e.target.value)}
                        placeholder={t('careerSource.businessProblemPlaceholder')}
                        className="w-full px-3 py-2 text-xs rounded-xl clean-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {t('careerSource.actionTaken')}
                      </label>
                      <input
                        type="text"
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        placeholder={t('careerSource.actionTakenPlaceholder')}
                        className="w-full px-3 py-2 text-xs rounded-xl clean-input"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveExpForNewBullet(null)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="button"
                      disabled={saving || !bulletText.trim()}
                      onClick={() => handleAddAccomplishment(exp.id)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {saving ? t('common.saving') : t('common.save')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
