'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/i18n/LanguageContext';
import { NavigationGuideStrip } from '@/components/NavigationGuideStrip';
import {
  MessageSquare,
  Sparkles,
  Send,
  Award,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Cpu,
  Compass,
  Briefcase,
  Copy,
  Check,
  Mic,
  MicOff,
  Square,
  Volume2,
  VolumeX,
  Clock,
  Radio,
  SlidersHorizontal,
  BarChart3,
} from 'lucide-react';
import {
  InterviewTrack,
  InterviewSessionDiagnostic,
  SpeechAnalytics,
} from '@/lib/ai/interviewEngine';

interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  isHighQuality?: boolean;
  qualityScore?: number;
  rawVoice?: SpeechSynthesisVoice;
}

const FALLBACK_VOICES_BY_LANG: Record<string, { id: string; name: string; lang: string }[]> = {
  pt: [
    { id: 'google_pt', name: '⭐ Google Português (Estilo Waze / Alta Qualidade)', lang: 'pt-BR' },
    { id: 'luciana_enhanced', name: '⭐ Luciana (Voz Natural de Alta Resolução)', lang: 'pt-BR' },
    { id: 'ricardo_pt', name: 'Ricardo (Diretor Técnico Executivo)', lang: 'pt-BR' },
  ],
  en: [
    { id: 'google_en', name: '⭐ Google US English (Natural Waze / Assistant)', lang: 'en-US' },
    { id: 'samantha_enhanced', name: '⭐ Samantha (Enhanced Big Tech Bar Raiser)', lang: 'en-US' },
    { id: 'david_en', name: 'David (VP of Product Executive)', lang: 'en-US' },
  ],
  es: [
    { id: 'google_es', name: '⭐ Google Español (Estilo Waze / Asistente)', lang: 'es-ES' },
    { id: 'monica_enhanced', name: '⭐ Mónica (Voz Natural de Alta Calidad)', lang: 'es-ES' },
    { id: 'carlos_es', name: 'Carlos (Director de Tecnología)', lang: 'es-ES' },
  ],
};

interface TurnUI {
  speaker: 'interviewer' | 'candidate';
  text: string;
  turnIndex: number;
  isAudio?: boolean;
  audioDuration?: number;
  analysis?: {
    score: number;
    strengths: string[];
    improvements: string[];
    speechAnalytics?: SpeechAnalytics;
  };
}

export default function InterviewLabPage() {
  const { t, language } = useI18n();

  // Configuration
  const [track, setTrack] = useState<InterviewTrack>('behavioral');
  const [targetLevel, setTargetLevel] = useState<'L4' | 'L5' | 'L6' | 'L7'>('L6');
  const [company, setCompany] = useState('Stripe');
  const [roleTitle, setRoleTitle] = useState('Staff Product Manager');

  // Recruiter Voice TTS state
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingTurnIndex, setSpeakingTurnIndex] = useState<number | null>(null);

  // Simulation state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<TurnUI[]>([]);
  const [candidateInput, setCandidateInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [diagnostic, setDiagnostic] = useState<InterviewSessionDiagnostic | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Audio recording & speech recognition state
  const [isAudioMode, setIsAudioMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load and refresh speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setBrowserVoices(voices);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Filter and rank voices STRICTLY for the current language
  const activeVoiceOptions: VoiceOption[] = React.useMemo(() => {
    const langPrefix = (language === 'pt' ? 'pt' : language === 'es' ? 'es' : 'en').toLowerCase();

    // Filter browser voices strictly matching this language
    const matching = browserVoices.filter((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith(langPrefix);
    });

    if (matching.length > 0) {
      const scored = matching.map((v) => {
        const nameLower = v.name.toLowerCase();
        let qualityScore = 0;
        let isHighQuality = false;

        // Top tier: Google voices (sounds like Google Assistant / Waze / Maps)
        if (nameLower.includes('google')) {
          qualityScore += 120;
          isHighQuality = true;
        }
        // Apple & Microsoft Enhanced / Neural / Premium voices
        if (
          nameLower.includes('enhanced') ||
          nameLower.includes('natural') ||
          nameLower.includes('neural') ||
          nameLower.includes('premium') ||
          nameLower.includes('siri')
        ) {
          qualityScore += 100;
          isHighQuality = true;
        }
        // Demote robotic compact/espeak voices
        if (nameLower.includes('compact') || nameLower.includes('espeak')) {
          qualityScore -= 80;
        }

        let displayName = v.name;
        if (nameLower.includes('google')) {
          displayName = `⭐ ${v.name} (Estilo Waze / Google Assistant)`;
        } else if (isHighQuality) {
          displayName = `⭐ ${v.name} (Alta Fidelidade / Natural)`;
        }

        return {
          id: v.voiceURI || v.name,
          name: displayName,
          lang: v.lang,
          isHighQuality,
          qualityScore,
          rawVoice: v,
        };
      });

      scored.sort((a, b) => b.qualityScore - a.qualityScore);
      return scored;
    }

    const fallback = FALLBACK_VOICES_BY_LANG[language] || FALLBACK_VOICES_BY_LANG.en;
    return fallback.map((f) => ({
      id: f.id,
      name: f.name,
      lang: f.lang,
      isHighQuality: true,
    }));
  }, [browserVoices, language]);

  // Keep selectedVoiceId in sync with active options
  useEffect(() => {
    if (activeVoiceOptions.length > 0) {
      const exists = activeVoiceOptions.some((v) => v.id === selectedVoiceId);
      if (!exists) {
        setSelectedVoiceId(activeVoiceOptions[0].id);
      }
    }
  }, [activeVoiceOptions, selectedVoiceId]);

  // Check speech recognition support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingTurnIndex(null);
  };

  const speakText = (text: string, turnIdx?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking && speakingTurnIndex === turnIdx) {
      stopSpeaking();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text and prepare smooth respiratory pauses
    const cleanText = text
      .replace(/[*_~`#]/g, '')
      .replace(/^[•\-–]\s+/gm, '')
      .replace(/[;:]/g, '.')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Look up selected voice object
    const chosenOption = activeVoiceOptions.find((v) => v.id === selectedVoiceId) || activeVoiceOptions[0];
    let targetVoice = chosenOption?.rawVoice;

    if (!targetVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const allVoices = window.speechSynthesis.getVoices();
      const langPrefix = (language === 'pt' ? 'pt' : language === 'es' ? 'es' : 'en').toLowerCase();
      // Try Google / Enhanced
      targetVoice =
        allVoices.find((v) => v.lang.toLowerCase().startsWith(langPrefix) && v.name.toLowerCase().includes('google')) ||
        allVoices.find(
          (v) =>
            v.lang.toLowerCase().startsWith(langPrefix) &&
            (v.name.toLowerCase().includes('enhanced') || v.name.toLowerCase().includes('natural'))
        ) ||
        allVoices.find((v) => v.lang.toLowerCase().startsWith(langPrefix) && !v.name.toLowerCase().includes('compact')) ||
        allVoices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    }

    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.lang = targetVoice?.lang || (language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US');
    utterance.rate = 0.98; // Natural, polished human speaking rate
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingTurnIndex(turnIdx ?? null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingTurnIndex(null);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis warning:', e);
      setIsSpeaking(false);
      setSpeakingTurnIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleTestVoice = () => {
    const testPhrases: Record<string, string> = {
      pt: 'Olá! Sou seu entrevistador executivo no The Career Lab. Vamos começar a sua simulação?',
      es: '¡Hola! Soy tu entrevistador ejecutivo en The Career Lab. ¿Comenzamos con la simulación?',
      en: 'Hello! I am your executive interviewer at The Career Lab. Shall we begin your simulation?',
    };
    const phrase = testPhrases[language] || testPhrases.en;
    speakText(phrase);
  };

  // Cleanup timers, streams & synthesis on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const quickStartersByLanguage: Record<string, string[]> = {
    pt: [
      'Na última reestruturação, identifiquei um desalinhamento entre engenharia e produto que gerava 4 semanas de atraso. Eu assumi a liderança transversal, convoquei os comitês técnicos e defini uma arquitetura em fases, reduzindo o tempo de entrega em 35% com 99.99% de disponibilidade.',
      'Durante a Black Friday, nosso gateway principal oscilou. Eu decidi imediatamente ativar o circuit breaker e redirecionar 40% do tráfego para a rota secundária, recuperando R$ 4.2M em transações sem perda de dados.',
      'Ao lançar o novo produto de pagamentos B2B, enfrentei ceticismo da diretoria sobre risco regulatório. Apresentei uma matriz de risco quantificada e executei um piloto com 10 enterprise clients, atingindo $800k em volume no primeiro mês.',
    ],
    es: [
      'Durante el último rediseño, detecté una fricción entre ingeniería y producto que causaba 4 semanas de retraso. Asumí el liderazgo transversal, redefiní los criterios de entrega y reduje el tiempo de salida al mercado un 35% manteniendo 99.99% de disponibilidad.',
      'En un pico de alta demanda, la pasarela de pagos comenzó a fallar. Decidí implementar de inmediato una política de reintentos escalonados con Redis, salvando $800k en transacciones críticas.',
      'Al lanzar la iniciativa 0-a-1 de pagos corporativos, convencí a los stakeholders escépticos con un piloto controlado en 10 clientes clave, alcanzando $1.2M en volumen el primer trimestre.',
    ],
    en: [
      'During our enterprise scaleup, I identified an architectural friction between Product and Platform engineering causing a 4-week release delay. I stepped up to lead cross-functional alignment, established phased SLAs, and reduced delivery latency by 35% while maintaining 99.99% uptime across 4.2M active users.',
      'When our payment processing latency spiked by 300% under peak load, I made the call to execute graceful service degradation and rerouted 45% of traffic to a secondary clearing partner, safeguarding $2.4M in GMV.',
      'Spearheading our 0-to-1 merchant payouts platform, I resolved conflicting roadmap priorities between Sales and Compliance by piloting with 15 enterprise beta accounts, achieving $12M in annualized transaction volume.',
    ],
  };

  const activeStarters = quickStartersByLanguage[language] || quickStartersByLanguage.en;

  // Start audio recording and live speech-to-text
  const startRecording = async () => {
    setPermissionError(false);
    setAudioUrl(null);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    // Map language code to speech recognition locale
    const localeMap: Record<string, string> = {
      pt: 'pt-BR',
      es: 'es-ES',
      en: 'en-US',
    };
    const recognitionLang = localeMap[language] || 'en-US';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);

      // Start SpeechRecognition for live transcription
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = recognitionLang;

        let accumulatedTranscript = '';

        recognition.onresult = (event: any) => {
          let currentSessionText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedTranscript += ' ' + transcript;
            } else {
              currentSessionText += transcript;
            }
          }
          const fullText = (accumulatedTranscript + ' ' + currentSessionText).trim();
          setCandidateInput(fullText);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
        };

        recognition.start();
      }

      setIsRecording(true);

      // Start second counter timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      setPermissionError(true);
      setIsRecording(false);
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
  };

  const handleStartSession = async () => {
    setIsStarting(true);
    setDiagnostic(null);
    try {
      const res = await fetch('/api/interview-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          track,
          targetLevel,
          company,
          roleTitle,
          language,
        }),
      });
      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setTurns([
          {
            speaker: 'interviewer',
            text: data.firstQuestion,
            turnIndex: 1,
          },
        ]);
        if (autoPlayVoice && data.firstQuestion) {
          setTimeout(() => {
            speakText(data.firstQuestion, 1);
          }, 400);
        }
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!candidateInput.trim() || !sessionId || isSubmitting) return;

    if (isRecording) {
      stopRecording();
    }

    const answerText = candidateInput.trim();
    const duration = recordingSeconds > 0 ? recordingSeconds : Math.round(answerText.split(/\s+/).length / 2.3);
    const wasAudio = isAudioMode;

    setCandidateInput('');
    setAudioUrl(null);
    setRecordingSeconds(0);
    setIsSubmitting(true);

    const currentTurnCount = turns.length;
    const tempCandidateTurn: TurnUI = {
      speaker: 'candidate',
      text: answerText,
      turnIndex: currentTurnCount + 1,
      isAudio: wasAudio,
      audioDuration: duration,
    };
    setTurns((prev) => [...prev, tempCandidateTurn]);

    try {
      const res = await fetch('/api/interview-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'turn',
          sessionId,
          candidateAnswer: answerText,
          track,
          language,
          durationSeconds: duration,
          isAudio: wasAudio,
        }),
      });
      const data = await res.json();
      if (data.analysis && data.nextQuestion) {
        const nextTurnIdx = currentTurnCount + 2;
        setTurns((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.speaker === 'candidate') {
            updated[lastIdx].analysis = data.analysis;
          }
          return [
            ...updated,
            {
              speaker: 'interviewer',
              text: data.nextQuestion,
              turnIndex: nextTurnIdx,
            },
          ];
        });
        if (autoPlayVoice && data.nextQuestion) {
          setTimeout(() => {
            speakText(data.nextQuestion, nextTurnIdx);
          }, 400);
        }
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishSession = async () => {
    if (!sessionId || isFinishing) return;
    stopSpeaking();
    setIsFinishing(true);
    try {
      const res = await fetch('/api/interview-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finish',
          sessionId,
          track,
        }),
      });
      const data = await res.json();
      if (data.diagnostic) {
        setDiagnostic(data.diagnostic);
      }
    } catch (err) {
      console.error('Failed to finish session:', err);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCopyDiagnostic = () => {
    if (!diagnostic) return;
    const text = `The Career Lab — Interview Diagnostic Report
Role: ${roleTitle} (${targetLevel}) @ ${company}
Overall Score: ${diagnostic.overallScore}/100
Calibrated Level: ${diagnostic.calibratedLevelRecommendation}

Strategic Matrix (Big Tech Bar):
- Strategic Depth & Business Impact: ${diagnostic.matrix?.strategicDepth ?? 80}%
- Communication Clarity & Structure: ${diagnostic.matrix?.clarityAndStructure ?? 80}%
- Problem-Solving / Crisis Management: ${diagnostic.matrix?.problemSolvingAndCrisis ?? 80}%

Pillars:
- Ownership & Leadership: ${diagnostic.pillars.ownership}%
- Quantified Business Impact: ${diagnostic.pillars.quantification}%
- Technical & Strategic Trade-offs: ${diagnostic.pillars.tradeoffs}%
- Clarity & STAR Structure: ${diagnostic.pillars.structure}%
- Executive Presence: ${diagnostic.pillars.presence}%

Key Strengths:
${diagnostic.keyStrengths.map((s) => `• ${s}`).join('\n')}

Coaching Notes:
${diagnostic.coachingNotes.map((n) => `• ${n}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const tracks = [
    { id: 'behavioral', label: 'Behavioral & Leadership', icon: Compass },
    { id: 'system_design', label: 'System Architecture', icon: Cpu },
    { id: 'product_strategy', label: 'Product & 0-to-1 Strategy', icon: TrendingUp },
    { id: 'executive', label: 'Executive & Cross-Functional', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <NavigationGuideStrip />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1.5">
            <MessageSquare className="w-4 h-4 text-brand-500" />
            <span>{t('interviewLab.title')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('interviewLab.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {t('interviewLab.subtitle')}
          </p>
        </div>

        {/* Configuration Cockpit */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Track Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('interviewLab.selectTrack')}
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as InterviewTrack)}
                disabled={!!sessionId && !diagnostic}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                {tracks.map((tItem) => (
                  <option key={tItem.id} value={tItem.id}>
                    {tItem.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('interviewLab.selectLevel')}
              </label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value as 'L4' | 'L5' | 'L6' | 'L7')}
                disabled={!!sessionId && !diagnostic}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                <option value="L4">L4 (Mid-Level)</option>
                <option value="L5">L5 (Senior)</option>
                <option value="L6">L6 (Staff / Lead)</option>
                <option value="L7">L7 (Principal / Director)</option>
              </select>
            </div>

            {/* Role Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Role Title
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                disabled={!!sessionId && !diagnostic}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Staff Product Manager"
              />
            </div>

            {/* Company & Action */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Company Target
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={!!sessionId && !diagnostic}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Stripe"
                />
                {!sessionId || diagnostic ? (
                  <button
                    type="button"
                    onClick={handleStartSession}
                    disabled={isStarting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-2xs whitespace-nowrap flex items-center space-x-1.5"
                  >
                    {isStarting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{t('interviewLab.startInterview')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishSession}
                    disabled={isFinishing}
                    className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors whitespace-nowrap"
                  >
                    {isFinishing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin inline mr-1" />
                    ) : null}
                    {t('interviewLab.endSession')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recruiter Voice & Audio Settings Bar */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center space-x-1.5">
                <Volume2 className="w-4 h-4 text-brand-600" />
                <span className="font-semibold text-slate-700">{t('interviewLab.interviewerVoice')}:</span>
              </div>
              <select
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500 max-w-[240px] sm:max-w-xs truncate"
              >
                {activeVoiceOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleTestVoice}
                className="px-2.5 py-1 rounded-lg border border-brand-200 bg-purple-50 hover:bg-purple-100 text-brand-700 text-xs font-semibold flex items-center space-x-1 transition-colors shadow-2xs"
                title="Ouvir uma frase de exemplo com esta voz"
              >
                <Volume2 className="w-3.5 h-3.5 text-brand-600" />
                <span>Ouvir Prévia</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoPlayVoice}
                  onChange={(e) => setAutoPlayVoice(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                />
                <span>{t('interviewLab.autoPlayVoice')}</span>
              </label>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-1 hover:bg-rose-100 transition-colors"
                >
                  <VolumeX className="w-3 h-3" />
                  <span>{t('interviewLab.stopAudio')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Simulation Arena */}
        {sessionId ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation Stream (2 Columns) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs min-h-[500px] flex flex-col justify-between">
                {/* Turns List */}
                <div className="space-y-4 mb-6 max-h-[560px] overflow-y-auto pr-1">
                  {turns.map((turn, idx) => {
                    const isInterviewer = turn.speaker === 'interviewer';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${
                          isInterviewer ? 'items-start' : 'items-end'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full max-w-[90%] sm:max-w-[85%] mb-1 text-[11px] font-semibold text-slate-500">
                          <div className="flex items-center space-x-1.5">
                            <span>
                              {isInterviewer
                                ? `${company} Bar Raiser (${targetLevel})`
                                : t('interviewLab.candidate')}
                            </span>
                            {isInterviewer && isSpeaking && speakingTurnIndex === turn.turnIndex && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.2 rounded-full bg-brand-50 text-brand-700 text-[9px] font-bold border border-brand-200 animate-pulse">
                                <Volume2 className="w-2.5 h-2.5 text-brand-600 animate-bounce" />
                                <span>{t('interviewLab.speakingNow')}</span>
                              </span>
                            )}
                            {!isInterviewer && turn.isAudio && (
                              <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full bg-purple-50 text-brand-600 text-[9px] font-bold border border-brand-200/60">
                                <Mic className="w-2.5 h-2.5" />
                                <span>Áudio ({turn.audioDuration}s)</span>
                              </span>
                            )}
                          </div>

                          {isInterviewer && (
                            <button
                              type="button"
                              onClick={() => speakText(turn.text, turn.turnIndex)}
                              className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold flex items-center space-x-1 transition-all ${
                                isSpeaking && speakingTurnIndex === turn.turnIndex
                                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                                  : 'bg-white border-slate-200 text-slate-600 hover:text-brand-700 hover:border-brand-300 shadow-2xs'
                              }`}
                              title={
                                isSpeaking && speakingTurnIndex === turn.turnIndex
                                  ? t('interviewLab.stopAudio')
                                  : t('interviewLab.playQuestion')
                              }
                            >
                              {isSpeaking && speakingTurnIndex === turn.turnIndex ? (
                                <>
                                  <VolumeX className="w-3 h-3 text-rose-600" />
                                  <span>{t('interviewLab.stopAudio')}</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3 text-brand-600" />
                                  <span>{t('interviewLab.playQuestion')}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <div
                          className={`p-4 rounded-2xl max-w-[90%] sm:max-w-[85%] text-xs leading-relaxed ${
                            isInterviewer
                              ? 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-sm'
                              : 'bg-brand-600 text-white rounded-tr-sm shadow-2xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{turn.text}</p>
                        </div>

                        {/* Instant turn feedback pill */}
                        {turn.analysis && (
                          <div className="mt-2 w-full max-w-[85%] bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 text-[11px] text-slate-700 space-y-2">
                            <div className="flex items-center justify-between font-bold text-amber-900">
                              <span className="flex items-center space-x-1">
                                <Award className="w-3.5 h-3.5 text-amber-600" />
                                <span>{t('interviewLab.realtimeFeedback')}</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                                {turn.analysis.score}/100
                              </span>
                            </div>

                            {/* Speech Analytics Badge (if audio response) */}
                            {turn.analysis.speechAnalytics?.isAudio && (
                              <div className="p-2 bg-white/80 rounded-lg border border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                                <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                                  <Volume2 className="w-3 h-3 text-brand-600" />
                                  <span>{turn.analysis.speechAnalytics.paceLabel || `${turn.analysis.speechAnalytics.wpm} PPM`}</span>
                                </div>
                                {turn.analysis.speechAnalytics.durationSeconds ? (
                                  <div className="flex items-center space-x-1 text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{turn.analysis.speechAnalytics.durationSeconds}s</span>
                                  </div>
                                ) : null}
                              </div>
                            )}

                            {/* Filler words badge */}
                            {turn.analysis.speechAnalytics?.fillerWordsFound &&
                              turn.analysis.speechAnalytics.fillerWordsFound.length > 0 && (
                                <div className="p-1.5 bg-amber-100/60 rounded-lg text-[10px] text-amber-900 border border-amber-200/50">
                                  <span className="font-semibold">{t('interviewLab.fillerWords')}: </span>
                                  <span className="font-mono">
                                    {turn.analysis.speechAnalytics.fillerWordsFound.join(', ')}
                                  </span>
                                </div>
                              )}

                            <div className="space-y-1">
                              {turn.analysis.strengths.map((s, sIdx) => (
                                <div key={sIdx} className="flex items-start space-x-1 text-slate-700">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{s}</span>
                                </div>
                              ))}
                              {turn.analysis.improvements.map((imp, impIdx) => (
                                <div key={impIdx} className="flex items-start space-x-1 text-slate-600">
                                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                                  <span>{imp}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {isSubmitting && (
                    <div className="flex items-center space-x-2 text-xs text-brand-600 font-medium py-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('interviewLab.submitting')}</span>
                    </div>
                  )}
                </div>

                {/* Candidate Response Arena: Audio Recording + Transcription */}
                {!diagnostic && (
                  <div className="pt-3 border-t border-slate-100">
                    {/* Mode Toggle: Audio vs Text */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold text-slate-600">
                        <button
                          type="button"
                          onClick={() => setIsAudioMode(true)}
                          className={`px-2.5 py-1 rounded-md flex items-center space-x-1 transition-all ${
                            isAudioMode ? 'bg-white text-brand-700 shadow-2xs font-bold' : 'hover:text-slate-900'
                          }`}
                        >
                          <Mic className="w-3 h-3 text-brand-600" />
                          <span>{t('interviewLab.voiceMode')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAudioMode(false)}
                          className={`px-2.5 py-1 rounded-md flex items-center space-x-1 transition-all ${
                            !isAudioMode ? 'bg-white text-brand-700 shadow-2xs font-bold' : 'hover:text-slate-900'
                          }`}
                        >
                          <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                          <span>{t('interviewLab.switchMode')}</span>
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400">
                        {isAudioMode ? 'A resposta por voz simula a cadência real da entrevista' : 'Modo texto manual'}
                      </span>
                    </div>

                    {/* Audio Recording Controller (Prominent) */}
                    {isAudioMode && (
                      <div className="mb-3 p-4 rounded-xl bg-purple-50/40 border border-brand-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          {isRecording ? (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-sm animate-pulse transition-all"
                              title={t('interviewLab.stopRecording')}
                            >
                              <Square className="w-5 h-5 fill-white" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={startRecording}
                              className="w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-sm transition-all group"
                              title={t('interviewLab.recordAnswer')}
                            >
                              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                          )}

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900">
                                {isRecording ? t('interviewLab.recording') : t('interviewLab.recordAnswer')}
                              </span>
                              {isRecording && (
                                <span className="flex items-center space-x-1 text-rose-600 font-mono font-bold text-xs">
                                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                                  <span>{formatTime(recordingSeconds)}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {isRecording
                                ? t('interviewLab.listening')
                                : 'Clique no microfone para responder falando. A fala será transcrita e avaliada.'}
                            </p>
                          </div>
                        </div>

                        {/* Audio Playback preview if recorded */}
                        {audioUrl && !isRecording && (
                          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                            <Volume2 className="w-3.5 h-3.5 text-brand-600" />
                            <audio controls src={audioUrl} className="h-6 w-36 sm:w-44" />
                            <button
                              type="button"
                              onClick={startRecording}
                              className="text-[10px] font-bold text-slate-500 hover:text-brand-700 ml-1"
                            >
                              {t('interviewLab.reRecord')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {permissionError && (
                      <div className="mb-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{t('interviewLab.micPermissionError')}</span>
                      </div>
                    )}

                    {/* Quick Starters */}
                    <div className="mb-2.5">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                        {t('interviewLab.quickStartersTitle')}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeStarters.map((starter, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => setCandidateInput(starter)}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-brand-700 border border-slate-200/60 transition-colors text-left truncate max-w-full"
                          >
                            {starter.slice(0, 75)}...
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Transcribed Text / Manual Editor */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>{isAudioMode ? t('interviewLab.audioTranscript') : 'Sua Resposta'}</span>
                        {candidateInput.trim() && (
                          <span className="text-[10px] text-slate-400">
                            {candidateInput.trim().split(/\s+/).length} palavras
                          </span>
                        )}
                      </div>
                      <div className="flex items-end space-x-2">
                        <textarea
                          rows={3}
                          value={candidateInput}
                          onChange={(e) => setCandidateInput(e.target.value)}
                          placeholder={isAudioMode ? 'A transcrição da sua fala aparecerá aqui em tempo real...' : t('interviewLab.typeAnswer')}
                          className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white resize-none leading-relaxed"
                        />
                        <button
                          type="button"
                          onClick={handleSubmitAnswer}
                          disabled={!candidateInput.trim() || isSubmitting}
                          className="px-4 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition-colors flex items-center space-x-1.5 shrink-0 shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t('interviewLab.sendAnswer')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Diagnostic / Session Insights Panel (1 Column) */}
            <div className="space-y-4">
              {diagnostic ? (
                <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-brand-600" />
                      <span>{t('interviewLab.diagnosticTitle')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyDiagnostic}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                    >
                      {copiedScript ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedScript ? t('common.copied') : 'Copiar'}</span>
                    </button>
                  </div>

                  {/* Overall Score */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-amber-50/50 border border-brand-100 text-center mb-4">
                    <span className="text-xs font-semibold text-slate-600 block">
                      {t('interviewLab.overallScore')}
                    </span>
                    <span className="text-3xl font-extrabold text-brand-700 tracking-tight">
                      {diagnostic.overallScore}
                      <span className="text-sm font-normal text-slate-400">/100</span>
                    </span>
                    <div className="mt-1 text-[11px] font-semibold text-emerald-700">
                      Calibrado para: {diagnostic.calibratedLevelRecommendation}
                    </div>
                  </div>

                  {/* 3-Pillar Strategic & Executive Matrix */}
                  {diagnostic.matrix && (
                    <div className="mb-4 p-3.5 rounded-xl bg-purple-50/50 border border-brand-100 space-y-2.5">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-900">
                        <BarChart3 className="w-4 h-4 text-brand-600" />
                        <span>Matriz de Liderança Executiva (Big Tech)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2.5 rounded-lg border border-brand-100/80 shadow-2xs">
                          <span className="text-[10px] font-medium text-slate-500 block leading-tight">
                            Profundidade & Impacto
                          </span>
                          <span className="text-base font-extrabold text-brand-700">
                            {diagnostic.matrix.strategicDepth}%
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-brand-100/80 shadow-2xs">
                          <span className="text-[10px] font-medium text-slate-500 block leading-tight">
                            Clareza Verbal & Estrutura
                          </span>
                          <span className="text-base font-extrabold text-brand-700">
                            {diagnostic.matrix.clarityAndStructure}%
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-brand-100/80 shadow-2xs">
                          <span className="text-[10px] font-medium text-slate-500 block leading-tight">
                            Solução de Problemas & Crise
                          </span>
                          <span className="text-base font-extrabold text-brand-700">
                            {diagnostic.matrix.problemSolvingAndCrisis}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Speech Delivery Session Summary (if audio used) */}
                  {turns.some((t) => t.isAudio) && (
                    <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="flex items-center space-x-1">
                          <Volume2 className="w-3.5 h-3.5 text-brand-600" />
                          <span>{t('interviewLab.verbalDelivery')}</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {turns.filter((t) => t.isAudio).length} respostas gravadas
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Cadência executiva, velocidade de fala e clareza verbal monitoradas ao longo de toda a simulação.
                      </p>
                    </div>
                  )}

                  {/* 5 Pillars Breakdown */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      {t('interviewLab.radarTitle')}
                    </span>

                    {[
                      { label: t('interviewLab.ownership'), val: diagnostic.pillars.ownership },
                      { label: t('interviewLab.quantification'), val: diagnostic.pillars.quantification },
                      { label: t('interviewLab.tradeoffs'), val: diagnostic.pillars.tradeoffs },
                      { label: t('interviewLab.structure'), val: diagnostic.pillars.structure },
                      { label: t('interviewLab.presence'), val: diagnostic.pillars.presence },
                    ].map((p, pIdx) => (
                      <div key={pIdx}>
                        <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                          <span>{p.label}</span>
                          <span className="font-bold text-slate-800">{p.val}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${p.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Strengths */}
                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      {t('interviewLab.keyStrengths')}
                    </span>
                    <ul className="space-y-1">
                      {diagnostic.keyStrengths.map((str, sIdx) => (
                        <li key={sIdx} className="text-[11px] text-slate-600 flex items-start space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Coaching Notes */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      {t('interviewLab.coachingNotes')}
                    </span>
                    <ul className="space-y-1">
                      {diagnostic.coachingNotes.map((note, nIdx) => (
                        <li key={nIdx} className="text-[11px] text-slate-600 flex items-start space-x-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs text-center text-slate-500 text-xs">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-brand-600 mx-auto flex items-center justify-center mb-3">
                    <Mic className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">Simulação com Áudio Ativo</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    Fale diretamente no microfone. A inteligência transcreverá suas palavras em tempo real e analisará tanto o conteúdo (propriedade, métricas e trade-offs) quanto a cadência e vícios de linguagem.
                  </p>
                  <div className="text-[11px] font-medium text-slate-400">
                    Turnos realizados: {turns.filter((t) => t.speaker === 'candidate').length}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State / Welcome Screen */
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-2xs text-center max-w-xl mx-auto my-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Mic className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-2">
              Pronto para Treinar sua Entrevista por Voz?
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              O Bar Raiser adaptativo conduzirá uma simulação por áudio no nível {targetLevel}, gravando e transcrevendo suas respostas em tempo real para avaliar conteúdo, clareza verbal e cadência executiva.
            </p>
            <button
              type="button"
              onClick={handleStartSession}
              disabled={isStarting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm inline-flex items-center space-x-2"
            >
              {isStarting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              <span>{t('interviewLab.startInterview')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
