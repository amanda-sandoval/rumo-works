"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Shield, Cookie, X, Check, ChevronRight } from "lucide-react";

export interface CookieConsentState {
  essential: true;
  analytics: boolean;
  updatedAt: string;
  version: string;
}

const STORAGE_KEY = "rumo_works_cookie_consent";
const CURRENT_VERSION = "1.0";
const GA_ID = "G-5E2ZTM446Z";
const CLARITY_ID = "ywdftpjaau";

let gaLoaded = false;
let clarityLoaded = false;

function getValidStoredConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.version === CURRENT_VERSION &&
      parsed.essential === true &&
      typeof parsed.analytics === "boolean" &&
      typeof parsed.updatedAt === "string"
    ) {
      return parsed as CookieConsentState;
    }
    return null;
  } catch {
    return null;
  }
}

function clearTrackingCookies() {
  if (typeof document === "undefined") return;
  const prefixes = ["_ga", "_clck", "_clsk"];
  const domain = window.location.hostname;
  const rootDomain = domain.startsWith("www.") ? domain.slice(4) : domain;

  const cookies = document.cookie.split(";");
  for (const c of cookies) {
    const name = c.split("=")[0].trim();
    if (prefixes.some((p) => name === p || name.startsWith(p))) {
      document.cookie = name + "=; Max-Age=-99999999; path=/;";
      document.cookie = name + "=; Max-Age=-99999999; path=/; domain=" + domain + ";";
      document.cookie = name + "=; Max-Age=-99999999; path=/; domain=." + domain + ";";
      document.cookie = name + "=; Max-Age=-99999999; path=/; domain=." + rootDomain + ";";
    }
  }
}

function activateAnalytics() {
  if (typeof window === "undefined") return;

  // 1. Atualizar Google Consent Mode v2
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("consent", "update", {
      analytics_storage: "granted",
    });
  }

  // 2. Injetar GA4 se ainda não carregado
  if (!gaLoaded && !document.getElementById("ga4-script")) {
    const script = document.createElement("script");
    script.id = "ga4-script";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(script);

    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("js", new Date());
      (window as any).gtag("config", GA_ID, {
        send_page_view: true,
      });
    }
    gaLoaded = true;
  }

  // 3. Injetar Microsoft Clarity se ainda não carregado
  if (!clarityLoaded && !document.getElementById("clarity-script")) {
    (function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = 1;
      t.id = "clarity-script";
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);
    clarityLoaded = true;
  }

  // 4. Atualizar Clarity Consent API v2
  if (typeof (window as any).clarity === "function") {
    (window as any).clarity("consentv2", {
      analytics_storage: "granted",
      ad_storage: "denied",
    });
  }
}

function deactivateAnalytics() {
  if (typeof window === "undefined") return;

  // 1. Negar Consent Mode v2 no Google
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("consent", "update", {
      analytics_storage: "denied",
    });
  }

  // 2. Negar Consent API v2 no Clarity
  if (typeof (window as any).clarity === "function") {
    (window as any).clarity("consentv2", {
      analytics_storage: "denied",
      ad_storage: "denied",
    });
  }

  // 3. Limpar cookies de telemetria
  clearTrackingCookies();
}

export function CookieConsentManager() {
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [analyticsToggle, setAnalyticsToggle] = useState(false);

  // Inicialização no cliente
  useEffect(() => {
    setMounted(true);
    const stored = getValidStoredConsent();
    if (stored) {
      setConsent(stored);
      setAnalyticsToggle(stored.analytics);
      setShowBanner(false);
      if (stored.analytics) {
        activateAnalytics();
      } else {
        deactivateAnalytics();
      }
    } else {
      // Sem consentimento ou inválido -> Default estrito: não carrega nada
      setShowBanner(true);
      setAnalyticsToggle(false);
      deactivateAnalytics();
    }

    // Ouvinte para reabrir modal a partir de qualquer ponto (rodapé, política, etc.)
    const handleOpenPreferences = () => {
      const current = getValidStoredConsent();
      setAnalyticsToggle(current ? current.analytics : false);
      setShowCustomizeModal(true);
    };

    window.addEventListener("rumo:open-cookie-preferences", handleOpenPreferences);
    return () => {
      window.removeEventListener("rumo:open-cookie-preferences", handleOpenPreferences);
    };
  }, []);

  const saveConsent = useCallback((analyticsGranted: boolean) => {
    const newState: CookieConsentState = {
      essential: true,
      analytics: analyticsGranted,
      updatedAt: new Date().toISOString(),
      version: CURRENT_VERSION,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // Ignorar erro em caso de storage restrito
    }

    setConsent(newState);
    setAnalyticsToggle(analyticsGranted);
    setShowBanner(false);
    setShowCustomizeModal(false);

    if (analyticsGranted) {
      activateAnalytics();
    } else {
      deactivateAnalytics();
    }
  }, []);

  const handleAcceptAll = () => saveConsent(true);
  const handleRejectAll = () => saveConsent(false);
  const handleSaveCustom = () => saveConsent(analyticsToggle);

  if (!mounted) return null;

  return (
    <>
      {/* 1. Banner Principal de Consentimento */}
      {showBanner && !showCustomizeModal && (
        <aside
          role="dialog"
          aria-label="Consentimento de Cookies"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-t border-borderWarm shadow-2xl transition-all duration-300"
        >
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sage-800 font-medium text-sm">
                <Cookie className="w-4 h-4 text-sage-700" />
                <span>Privacidade e Gestão de Cookies</span>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed max-w-4xl">
                A Rumo Works utiliza cookies essenciais para o funcionamento seguro da plataforma. Com o seu consentimento, usamos ferramentas analíticas (Google Analytics 4 e Microsoft Clarity) para compreender a navegação e melhorar a experiência, sempre com mascaramento de dados no Mapa Rumo. Saiba mais em nossa{" "}
                <Link
                  href="/politica-de-privacidade"
                  className="text-sage-800 underline underline-offset-2 hover:text-sage-900 font-medium"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={handleRejectAll}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-lg text-charcoal-400 bg-charcoal-50 hover:bg-charcoal-100 hover:text-charcoal-500 border border-borderWarm transition-colors focus:outline-none focus:ring-2 focus:ring-sage-700"
              >
                Rejeitar
              </button>
              <button
                type="button"
                onClick={() => setShowCustomizeModal(true)}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-lg text-charcoal-400 bg-white hover:bg-[#F6F3EE] hover:text-charcoal-500 border border-borderWarm transition-colors focus:outline-none focus:ring-2 focus:ring-sage-700"
              >
                Personalizar
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-5 py-2 text-xs font-semibold rounded-lg text-white bg-sage-700 hover:bg-sage-800 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-sage-800"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Modal de Personalização Granular */}
      {showCustomizeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-500/40 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl border border-borderWarm shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-borderWarm/70 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-sage-800" />
                </div>
                <div>
                  <h2 id="cookie-modal-title" className="font-serif text-lg sm:text-xl font-semibold text-charcoal-500">
                    Preferências de Cookies
                  </h2>
                  <p className="text-xs text-charcoal-200">
                    Controle de privacidade e consentimento da Rumo Works
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomizeModal(false)}
                className="text-charcoal-200 hover:text-charcoal-500 p-1.5 rounded-lg hover:bg-charcoal-50 transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed">
              Você pode definir quais categorias de cookies autoriza. Os cookies essenciais são necessários para o funcionamento e a segurança do site. As ferramentas analíticas só coletam dados se você concordar ativamente.
            </p>

            <div className="space-y-4">
              {/* Categoria 1: Essenciais */}
              <div className="p-4 rounded-xl border border-borderWarm bg-[#FAF8F5]/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-charcoal-500">
                    Cookies Essenciais e Técnicos
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-sage-100 text-sage-800 border border-sage-200/60 font-semibold">
                    Sempre Ativos
                  </span>
                </div>
                <p className="text-xs text-charcoal-200 leading-relaxed">
                  Garantem segurança, integridade dos formulários, persistência da sessão e registro das suas escolhas de privacidade. Não podem ser desativados.
                </p>
              </div>

              {/* Categoria 2: Analíticos */}
              <div className="p-4 rounded-xl border border-borderWarm bg-white hover:border-sage-300 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-charcoal-500 block">
                      Cookies Analíticos e Usabilidade
                    </span>
                    <span className="text-xs text-charcoal-200">
                      Google Analytics 4 e Microsoft Clarity
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsToggle}
                      onChange={(e) => setAnalyticsToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-charcoal-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-charcoal-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-700"></div>
                  </label>
                </div>
                <p className="text-xs text-charcoal-200 leading-relaxed">
                  Permitem mensurar o tráfego de forma agregada (GA4) e visualizar mapas de calor e fluidez de navegação (Clarity) para aprimorar o serviço. As respostas do questionário e dados de diagnóstico são estritamente mascarados.
                </p>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="pt-4 border-t border-borderWarm/70 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectAll}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium rounded-lg text-charcoal-400 hover:text-charcoal-500 hover:bg-charcoal-50 transition-colors"
              >
                Rejeitar todos
              </button>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-lg text-charcoal-500 bg-white hover:bg-[#FAF8F5] border border-borderWarm transition-colors"
                >
                  Salvar preferências
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold rounded-lg text-white bg-sage-700 hover:bg-sage-800 transition-colors shadow-xs"
                >
                  Aceitar todos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Botão Flutuante Discreto para Reabertura Rápida de Preferências */}
      {!showBanner && !showCustomizeModal && (
        <button
          type="button"
          onClick={() => {
            const current = getValidStoredConsent();
            setAnalyticsToggle(current ? current.analytics : false);
            setShowCustomizeModal(true);
          }}
          className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-charcoal-300 bg-white/90 hover:bg-white hover:text-sage-800 border border-borderWarm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sage-700"
          aria-label="Gerenciar preferências de cookies"
        >
          <Shield className="w-3.5 h-3.5 text-sage-700" />
          <span className="hidden sm:inline">Preferências de Cookies</span>
        </button>
      )}
    </>
  );
}

export function CookiePreferencesButton({
  className = "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-xs font-semibold shadow-xs transition-colors",
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("rumo:open-cookie-preferences"));
        }
      }}
      className={className}
    >
      <Cookie className="w-4 h-4" />
      <span>Gerenciar Preferências de Cookies</span>
    </button>
  );
}
