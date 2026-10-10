import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/brand/Logo';
import { ArrowLeft, LockKeyhole } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Rumo Works',
  description:
    'Política de Privacidade do Rumo Works. Diretrizes de proteção de dados pessoais em conformidade com a LGPD.',
};

export default function PoliticaDePrivacidadePage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-charcoal-500 selection:bg-sage-700 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-borderWarm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-300 hover:text-sage-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-sage-700" />
            <span>Voltar ao início</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Document Header */}
        <div className="mb-12 border-b border-borderWarm pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-200/60 mb-4">
            <LockKeyhole className="w-3.5 h-3.5 text-sage-700" />
            <span>Privacidade e LGPD</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-4">
            Política de Privacidade
          </h1>
          <p className="text-sm sm:text-base text-charcoal-200 leading-relaxed max-w-2xl">
            A sua privacidade e a proteção dos seus dados são prioridades fundamentais. Esta política descreve como os dados são tratados no <strong>Rumo Works</strong>, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>
          <p className="text-xs text-charcoal-100 mt-3 font-mono">
            Última atualização: Outubro de {currentYear}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-charcoal-300 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sage-700 text-ivory-50 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                01
              </span>
              Princípio da Coleta Mínima de Dados
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                O Rumo Works opera sob o princípio da <strong>minimização de dados</strong>. Coletamos estritamente as informações necessárias para viabilizar a comunicação, o agendamento de mentorias e o uso das ferramentas de diagnóstico.
              </p>
              <p>
                Os dados tratados limitam-se a:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-sm text-charcoal-300">
                <li><strong>Nome completo:</strong> para identificação no contato.</li>
                <li><strong>Endereço de e-mail e/ou perfil do LinkedIn:</strong> para comunicação e agendamento.</li>
                <li><strong>Contexto profissional:</strong> momento de carreira e objetivos de desenvolvimento pessoal que o próprio participante decida compartilhar.</li>
              </ul>
              <p className="text-xs text-charcoal-100 pt-2">
                * Não coletamos dados sensíveis (origem racial, convicção religiosa, dados de saúde, filiação política/sindical) nem solicitamos documentos oficiais (CPF, RG) ou informações financeiras.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sage-700 text-ivory-50 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                02
              </span>
              Finalidade do Tratamento dos Dados
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                As informações fornecidas voluntariamente têm finalidade única e exclusiva:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-sm text-charcoal-300">
                <li>Responder a manifestações de interesse no programa de mentoria e ferramentas de desenvolvimento.</li>
                <li>Alinhar disponibilidade de horários e organizar os agendamentos das sessões individuais.</li>
                <li>Enviar lembretes e links de acesso às conversas por videoconferência.</li>
              </ul>
              <p>
                Os dados <strong>não são utilizados</strong> para fins de marketing, publicidade comercial, envio de newsletters não solicitadas ou qualquer atividade lucrativa.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sage-700 text-ivory-50 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                03
              </span>
              Não Compartilhamento e Não Comercialização
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                O Rumo Works assume o compromisso solene de que <strong>seus dados jamais serão vendidos, alugados, cedidos ou comercializados</strong> com terceiros, parceiros, empresas de recrutamento ou anunciantes.
              </p>
              <p>
                Nenhum dado é compartilhado com empregadores passados, presentes ou futuros, garantindo total independência e sigilo para todos os participantes.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sage-700 text-ivory-50 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                04
              </span>
              Armazenamento e Segurança das Informações
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                As informações são armazenadas em ambientes seguros, protegidos por autenticação e controles de acesso rigorosos. Adotamos medidas técnicas e organizacionais proporcionais para proteger os dados pessoais contra acessos não autorizados, perdas ou alterações indevidas.
              </p>
              <p>
                Os dados são mantidos apenas pelo período necessário para a condução das sessões de mentoria e diagnósticos, sendo descartados de forma segura após o encerramento da participação.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sage-700 text-ivory-50 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                05
              </span>
              Seus Direitos como Titular de Dados (LGPD)
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                Em conformidade com o Artigo 18 da Lei Geral de Proteção de Dados (LGPD), você possui o direito de, a qualquer momento:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-sm text-charcoal-300">
                <li>Confirmar a existência de tratamento dos seus dados.</li>
                <li>Acessar as informações mantidas sobre você.</li>
                <li>Solicitar a correção de dados incompletos ou inexatos.</li>
                <li>Solicitar a eliminação completa e definitiva dos seus dados dos registros do projeto.</li>
                <li>Revogar o consentimento previamente fornecido para contato.</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sage-700 text-ivory-50 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                06
              </span>
              Contato e Solicitações de Privacidade
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                Para exercer qualquer um dos seus direitos de titular ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato através do e-mail oficial:{' '}
                <a
                  href="mailto:contato@rumoworkshub.com.br"
                  className="text-sage-800 hover:text-sage-900 font-medium underline underline-offset-4"
                >
                  contato@rumoworkshub.com.br
                </a>
                .
              </p>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-borderWarm flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sage-800 hover:text-sage-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a página principal</span>
          </Link>
          <Link
            href="/termos-de-uso"
            className="text-xs text-charcoal-200 hover:text-sage-800 underline underline-offset-4 transition-colors"
          >
            Ver Termos de Uso →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-borderWarm bg-[#F6F3EE] py-8 text-center text-xs text-charcoal-100">
        <p>&copy; {currentYear} Rumo Works. Compromisso permanente com a privacidade e proteção de dados.</p>
      </footer>
    </div>
  );
}
