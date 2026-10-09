import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/brand/Logo';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Termos de Uso | Rumo Works',
  description:
    'Termos de Uso da iniciativa voluntária e independente Rumo Works. Diretrizes, escopo de desenvolvimento profissional geral e compromissos éticos.',
};

export default function TermosDeUsoPage() {
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
            <ShieldCheck className="w-3.5 h-3.5 text-sage-700" />
            <span>Transparência & Conformidade</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-4">
            Termos de Uso
          </h1>
          <p className="text-sm sm:text-base text-charcoal-200 leading-relaxed max-w-2xl">
            Estes termos descrevem os princípios, o escopo de atuação e as diretrizes éticas da iniciativa voluntária de mentoria e desenvolvimento profissional <strong>Rumo Works</strong>.
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
              Natureza do Projeto e Escopo de Atuação
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                O <strong>Rumo Works</strong> é uma iniciativa pessoal, voluntária e 100% gratuita idealizada e conduzida por Amanda Sandoval. O projeto tem como finalidade exclusiva o <strong>desenvolvimento profissional geral</strong>, o autoconhecimento, o aprimoramento de habilidades interpessoais, comunicação e postura no ambiente corporativo.
              </p>
              <p>
                O Rumo Works <strong>não constitui prestação de serviços comerciais</strong>, relação de consumo, consultoria jurídica, assessoria corporativa remunerada ou intermediação de trabalho. Nenhuma cobrança financeira é ou será realizada pela participação nas sessões.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sage-700 text-ivory-50 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                02
              </span>
              Independência e Ausência de Vínculos Institucionais
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                A iniciativa é de caráter estritamente pessoal e autônomo. O Rumo Works <strong>não possui qualquer vínculo institucional, comercial, patrocínio ou endosso</strong> de empresas, empregadores passados ou presentes, nem atua em nome ou representação de qualquer pessoa jurídica.
              </p>
              <p>
                As opiniões, reflexões e direcionamentos compartilhados durante as conversas refletem unicamente a perspectiva individual da mentora enquanto profissional, não devendo ser interpretados como diretrizes ou manifestações institucionais de terceiros.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sage-700 text-ivory-50 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                03
              </span>
              Inexistência de Promessas ou Garantias de Emprego
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                O Rumo Works <strong>não oferece promessas, garantias ou expectativas</strong> de contratação, aprovação em processos seletivos, promoções, aumentos salariais ou vagas em empresas específicas.
              </p>
              <p>
                A mentoria não engloba preparação para entrevistas técnicas, simulações de contratação para empresas específicas, consultoria sobre sistemas de recrutamento (ATS) ou indicações internas de candidatos. As decisões e movimentos de carreira são de responsabilidade exclusiva de cada participante.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sage-700 text-ivory-50 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                04
              </span>
              Confidencialidade e Limites Éticos
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                As conversas de mentoria são conduzidas em ambiente de respeito mútuo, ética e confidencialidade. Informações pessoais compartilhadas durante as sessões não são divulgadas publicamente.
              </p>
              <p>
                <strong>É expressamente vedado</strong> o compartilhamento de informações confidenciais, dados proprietários, segredos de negócio ou processos internos de empregadores atuais ou anteriores — tanto por parte da mentora quanto por parte dos mentorados.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sage-700 text-ivory-50 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                05
              </span>
              Participação Voluntária e Disponibilidade
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                Por se tratar de um projeto voluntário, a realização e a periodicidade das sessões estão condicionadas à disponibilidade de agenda mútua e ao alinhamento prévio de expectativas. A manifestação de interesse não gera obrigação contratual de atendimento ou continuidade para nenhuma das partes.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-4 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-sage-700 text-ivory-50 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                06
              </span>
              Canais de Contato
            </h2>
            <div className="space-y-3 text-charcoal-200">
              <p>
                Para dúvidas, esclarecimentos ou comunicações relacionadas a estes Termos de Uso, utilize o perfil oficial no LinkedIn:{' '}
                <a
                  href="https://www.linkedin.com/in/amandasandoval/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sage-800 hover:text-sage-900 font-medium underline underline-offset-4"
                >
                  linkedin.com/in/amandasandoval
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
            href="/politica-de-privacidade"
            className="text-xs text-charcoal-200 hover:text-sage-800 underline underline-offset-4 transition-colors"
          >
            Ver Política de Privacidade →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-borderWarm bg-[#F6F3EE] py-8 text-center text-xs text-charcoal-100">
        <p>&copy; {currentYear} Rumo Works. Iniciativa voluntária e independente.</p>
      </footer>
    </div>
  );
}
