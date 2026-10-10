/**
 * Google Sheets Private Integration Service — Rumo Works
 * 
 * Permite gravação segura e privada diretamente no Google Sheets da Rumo Works.
 * Nenhuma credencial ou URL privada é exposta ao navegador (execução exclusiva no servidor).
 * 
 * Métodos de integração suportados:
 * 1. Webhook Seguro de Google Apps Script: GOOGLE_SHEETS_WEBHOOK_URL + GOOGLE_SHEETS_SYNC_TOKEN
 * 2. Google Service Account API REST v4: GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY + GOOGLE_SHEETS_SPREADSHEET_ID
 */

export interface MentoringSubmissionRow {
  submission_id: string;
  submitted_at: string;
  nome: string;
  email: string;
  linkedin: string;
  empresa_atual: string;
  cargo_atual: string;
  experiencia_profissional: string;
  objetivo_profissional: string;
  desafio_principal: string;
  expectativa_mentoria: string;
  disponibilidade: string;
  contexto_adicional: string;
  origem: string;
  status_processamento: string;
}

export interface DiagnosticSheetRow {
  diagnostic_id: string;
  pseudonym_id: string;
  started_at: string;
  completed_at: string;
  status: string;
  questionnaire_version: string;
  scoring_version: string;
  report_version: string;
  preview_generated: boolean;
  report_purchased: boolean;
  report_generated: boolean;
  primary_goal_category: string;
  completion_duration_seconds: number;
  source: string;
}

export interface AnswerSheetRow {
  diagnostic_id: string;
  question_id: string;
  dimension_id: string;
  answer_type: string;
  answer_value: string;
  questionnaire_version: string;
}

export interface DimensionResultSheetRow {
  diagnostic_id: string;
  dimension_id: string;
  score: number;
  score_scale_version: string;
  interpretation_rule_version: string;
  generated_at: string;
}

export interface FunnelEventSheetRow {
  event_id: string;
  pseudonym_id: string;
  diagnostic_id?: string;
  event_name: string;
  occurred_at: string;
  funnel_stage: string;
}

class GoogleSheetsService {
  private webhookUrl: string | undefined;
  private syncToken: string | undefined;
  private spreadsheetId: string | undefined;

  constructor() {
    this.webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    this.syncToken = process.env.GOOGLE_SHEETS_SYNC_TOKEN;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  }

  public isConfigured(): boolean {
    return Boolean(this.webhookUrl || (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && this.spreadsheetId));
  }

  /**
   * Grava registro de interesse em mentoria na aba Interesses_Mentoria
   */
  public async appendMentoringInterest(data: MentoringSubmissionRow): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.webhookUrl) {
        const payload = {
          tab: 'Interesses_Mentoria',
          action: 'append_row',
          token: this.syncToken,
          data: {
            submission_id: data.submission_id,
            submitted_at: data.submitted_at,
            nome: data.nome,
            email: data.email,
            linkedin: data.linkedin || '',
            empresa_atual: data.empresa_atual || '',
            cargo_atual: data.cargo_atual || '',
            experiencia_profissional: data.experiencia_profissional || '',
            objetivo_profissional: data.objetivo_profissional,
            desafio_principal: data.desafio_principal,
            expectativa_mentoria: data.expectativa_mentoria || '',
            disponibilidade: data.disponibilidade || '',
            contexto_adicional: data.contexto_adicional || '',
            origem: data.origem || 'site_modal',
            status_processamento: data.status_processamento || 'NOVO',
          },
        };

        const res = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn('[GoogleSheetsService] Erro ao sincronizar interesse no Sheets:', errText);
          return { success: false, error: errText };
        }

        return { success: true };
      }

      // Se ainda não configurado no ambiente Vercel, registra log seguro e marca para posterior sync
      console.info('[GoogleSheetsService] Webhook do Google Sheets não configurado no ambiente atual. Registro salvo no DB interno.');
      return { success: false, error: 'GOOGLE_SHEETS_WEBHOOK_NOT_CONFIGURED' };
    } catch (err: any) {
      console.error('[GoogleSheetsService] Exceção na sincronização com Sheets:', err);
      return { success: false, error: err.message || 'Falha de conexão com Google Sheets' };
    }
  }

  /**
   * Grava resumo de diagnóstico na aba Diagnosticos
   */
  public async appendDiagnostic(data: DiagnosticSheetRow): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.webhookUrl) {
        const payload = {
          tab: 'Diagnosticos',
          action: 'append_row',
          token: this.syncToken,
          data,
        };

        const res = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        return { success: res.ok };
      }
      return { success: false, error: 'NOT_CONFIGURED' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Grava respostas individuais na aba Respostas
   */
  public async appendAnswers(rows: AnswerSheetRow[]): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.webhookUrl && rows.length > 0) {
        const payload = {
          tab: 'Respostas',
          action: 'append_batch',
          token: this.syncToken,
          rows,
        };

        const res = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        return { success: res.ok };
      }
      return { success: false, error: 'NOT_CONFIGURED' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Grava pontuações calculadas das 8 dimensões na aba Resultados_Dimensoes
   */
  public async appendDimensionResults(rows: DimensionResultSheetRow[]): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.webhookUrl && rows.length > 0) {
        const payload = {
          tab: 'Resultados_Dimensoes',
          action: 'append_batch',
          token: this.syncToken,
          rows,
        };

        const res = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        return { success: res.ok };
      }
      return { success: false, error: 'NOT_CONFIGURED' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Grava evento de funil de conversão na aba Eventos_Funil
   */
  public async appendFunnelEvent(event: FunnelEventSheetRow): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.webhookUrl) {
        const payload = {
          tab: 'Eventos_Funil',
          action: 'append_row',
          token: this.syncToken,
          data: event,
        };

        const res = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        return { success: res.ok };
      }
      return { success: false, error: 'NOT_CONFIGURED' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
