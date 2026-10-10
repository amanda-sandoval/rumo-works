'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { STAGES_METADATA } from '@/lib/mapa/content/questions';

export default function MapaLandingPage() {
  const router = useRouter();
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [existingStage, setExistingStage] = useState(1);
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mapa_rumo_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id && parsed.accessToken) {
          setHasExistingSession(true);
          setExistingStage(parsed.currentStage || 1);
          if (parsed.participantName) {
            setParticipantName(parsed.participantName);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleStartNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/mapa/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: participantName.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.session) {
        localStorage.setItem('mapa_rumo_session', JSON.stringify(data.session));
        router.push('/mapa/questionario');
      }
    } catch (err) {
      console.error('Erro ao iniciar sessão:', err);
      // Fallback: vai direto para o questionário
      router.push('/mapa/questionario');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = () => {
    router.push('/mapa/questionario');
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Badge e Título de Abertura */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200 shadow-2xs mb-6">
          <Compass className="w-3.5 h-3.5 text-cobalt-500" />
          <span>Diagnóstico de Autoconhecimento Profissional</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-charcoal-500 tracking-tight leading-[1.15] mb-6">
          Como você funciona no trabalho, o que importa para você e seus próximos passos.
        </h1>

        <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed">
          Uma ferramenta reflexiva para investigar suas motivações essenciais, padrões de energia, relação com limites e prioridades práticas para os próximos 30 dias.
        </p>
      </div>

      {/* Cartão de Continuação se já houver sessão */}
      {hasExistingSession && (
        <div className="mb-10 p-5 rounded-2xl bg-white border border-cobalt-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cobalt-100 text-cobalt-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-500">
                Identificamos um diagnóstico em andamento
              </p>
              <p className="text-xs text-charcoal-200">
                Você estava na <strong>Etapa {existingStage} de 6</strong>. Suas respostas anteriores estão preservadas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResume}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-cobalt-500 hover:bg-cobalt-600 text-white shadow-xs transition-all shrink-0"
          >
            Continuar de onde parei →
          </button>
        </div>
      )}

      {/* Formulário de Inicialização com Nome Opcional */}
      <div className="bg-white rounded-3xl border border-borderWarm p-7 sm:p-10 shadow-xl mb-14">
        <form onSubmit={handleStartNew} className="max-w-xl mx-auto space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block font-serif text-sm font-semibold text-charcoal-500 mb-1"
            >
              Como prefere que nos dirijamos a você?{' '}
              <span className="text-xs font-sans font-normal text-charcoal-200">(opcional)</span>
            </label>
            <p className="text-xs text-charcoal-200 mb-2">
              Seu nome ou primeiro nome será utilizado exclusivamente para personalizar a leitura do seu relatório.
            </p>
            <input
              id="name"
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Ex: Amanda"
              className="w-full px-4 py-3 rounded-xl border border-borderWarm focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-200 outline-none text-sm text-charcoal-500 bg-ivory-50 transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-sm font-semibold bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.99] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <span>{loading ? 'Preparando...' : 'Iniciar meu Mapa Rumo Gratuito'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-borderWarm text-center text-xs text-charcoal-300">
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cobalt-500" />
              <span>Duração: ~12 a 15 min</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cobalt-500" />
              <span>Prévia gratuita real</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cobalt-500" />
              <span>6 etapas reflexivas</span>
            </div>
          </div>
        </form>
      </div>

      {/* Visão Geral das 6 Etapas do Diagnóstico */}
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 text-center mb-8">
          O que você vai explorar ao longo do diagnóstico:
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STAGES_METADATA.map((stage) => (
            <div
              key={stage.stage}
              className="p-4 rounded-2xl bg-white border border-borderWarm/80 flex items-start gap-3.5 shadow-2xs hover:border-cobalt-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-cobalt-50 text-cobalt-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                0{stage.stage}
              </div>
              <div>
                <h3 className="text-xs font-bold text-charcoal-500">{stage.title}</h3>
                <p className="text-[11px] text-charcoal-200 mt-0.5 leading-relaxed">
                  {stage.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
