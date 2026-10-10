/**
 * Cliente de telemetria e analytics de funil seguro e privado da Rumo Works
 */
export interface TrackEventParams {
  eventName: string;
  sessionId?: string;
  diagnosticId?: string;
  pseudonymId?: string;
  funnelStage?: string;
  metadata?: Record<string, any>;
}

export function trackEvent(params: TrackEventParams): void {
  if (typeof window === 'undefined') return;

  try {
    const payload = {
      ...params,
      timestamp: new Date().toISOString(),
    };

    // Usar sendBeacon se disponível ou fetch assíncrono não bloqueante
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Silêncio intencional em caso de offline
      });
    }
  } catch {
    // Silêncio intencional
  }
}
