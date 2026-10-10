'use client';

import React, { useState } from 'react';
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  Mail,
  Linkedin,
  Building,
  Briefcase,
  Target,
  Sparkles,
} from 'lucide-react';

interface MentoringInterestFormProps {
  onSuccess?: () => void;
  source?: string;
}

export const MentoringInterestForm: React.FC<MentoringInterestFormProps> = ({
  onSuccess,
  source = 'site_modal',
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    linkedin: '',
    empresaAtual: '',
    cargoAtual: '',
    experienciaProfissional: '',
    objetivoProfissional: '',
    desafioPrincipal: '',
    expectativaMentoria: '',
    disponibilidade: 'fora_horario_comercial',
    contextoAdicional: '',
    website_trap: '', // Honeypot anti-spam invisível
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Por favor, informe seu nome completo.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Por favor, informe um e-mail válido.';
    }

    if (!formData.objetivoProfissional.trim()) {
      newErrors.objetivoProfissional = 'Por favor, descreva seu principal objetivo profissional.';
    } else if (formData.objetivoProfissional.trim().length < 5) {
      newErrors.objetivoProfissional = 'Conte-nos um pouco mais sobre o seu objetivo (mínimo 5 caracteres).';
    }

    if (!formData.desafioPrincipal.trim()) {
      newErrors.desafioPrincipal = 'Por favor, conte qual o seu maior desafio no momento.';
    } else if (formData.desafioPrincipal.trim().length < 5) {
      newErrors.desafioPrincipal = 'Descreva seu desafio atual com mais detalhes.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/mentoring/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          origem: source,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitSuccess(true);
        if (onSuccess) {
          setTimeout(() => onSuccess(), 4000);
        }
      } else {
        setServerError(data.error || 'Ocorreu um erro ao enviar. Por favor, tente novamente.');
      }
    } catch (err) {
      setServerError('Falha de conexão. Por favor, verifique sua internet e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-sage-200 shadow-sm animate-in fade-in duration-300">
        <div className="w-14 h-14 bg-sage-100 text-sage-800 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-sage-800" />
        </div>

        <h3 className="font-serif text-2xl font-semibold text-charcoal-500 mb-3">
          Informações Recebidas!
        </h3>

        <p className="text-sm text-charcoal-300 leading-relaxed max-w-md mx-auto mb-6">
          Obrigada pelo interesse na Rumo Works! Suas informações foram recebidas e serão analisadas para entender se a mentoria é adequada aos seus objetivos.
        </p>

        <div className="p-4 rounded-xl bg-ivory-50 border border-borderWarm text-xs text-charcoal-200 max-w-md mx-auto text-left flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
          <span>
            Cada perfil é avaliado de forma criteriosa e personalizada para garantir que o processo de mentoria seja verdadeiramente útil ao seu momento de carreira.
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* Campo Honeypot Oculto (Anti-Spam) */}
      <input
        type="text"
        name="website_trap"
        value={formData.website_trap}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {serverError && (
        <div className="p-4 rounded-xl bg-terracotta-50 border border-terracotta-200 text-xs text-terracotta-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-terracotta-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Grid 1: Nome e E-mail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="form_nome" className="block text-xs font-semibold text-charcoal-400 mb-1.5">
            Nome Completo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="form_nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-charcoal-500 bg-white transition-all focus:outline-none focus:ring-2 ${
                errors.nome
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-borderWarm focus:border-sage-700 focus:ring-sage-100'
              }`}
            />
          </div>
          {errors.nome && <p className="text-[11px] text-red-500 mt-1">{errors.nome}</p>}
        </div>

        <div>
          <label htmlFor="form_email" className="block text-xs font-semibold text-charcoal-400 mb-1.5">
            E-mail Profissional ou Pessoal <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="form_email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu.email@exemplo.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-charcoal-500 bg-white transition-all focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-borderWarm focus:border-sage-700 focus:ring-sage-100'
              }`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Grid 2: LinkedIn e Empresa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="form_linkedin" className="block text-xs font-semibold text-charcoal-400 mb-1.5">
            Perfil no LinkedIn <span className="text-charcoal-200 font-normal">(opcional)</span>
          </label>
          <input
            id="form_linkedin"
            name="linkedin"
            type="text"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="linkedin.com/in/seuperfil"
            className="w-full px-3.5 py-2.5 rounded-xl border border-borderWarm text-xs text-charcoal-500 bg-white focus:border-sage-700 focus:ring-2 focus:ring-sage-100 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="form_empresa" className="block text-xs font-semibold text-charcoal-400 mb-1.5">
            Empresa ou Organização Atual <span className="text-charcoal-200 font-normal">(opcional)</span>
          </label>
          <input
            id="form_empresa"
            name="empresaAtual"
            type="text"
            value={formData.empresaAtual}
            onChange={handleChange}
            placeholder="Onde atua atualmente"
            className="w-full px-3.5 py-2.5 rounded-xl border border-borderWarm text-xs text-charcoal-500 bg-white focus:border-sage-700 focus:ring-2 focus:ring-sage-100 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid 3: Cargo e Experiência */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="form_cargo" className="block text-xs font-semibold text-charcoal-400 mb-1.5">
            Cargo ou Função Atual <span className="text-charcoal-200 font-normal">(opcional)</span>
          </label>
          <input
            id="form_cargo"
            name="cargoAtual"
            type="text"
            value={formData.cargoAtual}
            onChange={handleChange}
            placeholder="Ex: Gerente de Produto, Tech Lead..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-borderWarm text-xs text-charcoal-500 bg-white focus:border-sage-700 focus:ring-2 focus:ring-sage-100 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="form_experiencia" className="block text-xs font-semibold text-charcoal-400 mb-1.5">
            Tempo de Experiência Profissional
          </label>
          <select
            id="form_experiencia"
            name="experienciaProfissional"
            value={formData.experienciaProfissional}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-borderWarm text-xs text-charcoal-500 bg-white focus:border-sage-700 focus:ring-2 focus:ring-sage-100 focus:outline-none transition-all"
          >
            <option value="">Selecione sua faixa de experiência</option>
            <option value="ate_3_anos">Até 3 anos de carreira</option>
            <option value="4_a_7_anos">4 a 7 anos (Pleno/Início de Liderança)</option>
            <option value="8_a_14_anos">8 a 14 anos (Sênior/Coordenação/Gestão)</option>
            <option value="mais_15_anos">15+ anos (Diretoria/Executivo/Especialista sênior)</option>
            <option value="transicao">Em momento de transição/reposicionamento</option>
          </select>
        </div>
      </div>

      {/* Objetivo Profissional */}
      <div>
        <label htmlFor="form_objetivo" className="block text-xs font-semibold text-charcoal-400 mb-1.5">
          Qual é o seu principal objetivo profissional no momento? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="form_objetivo"
          name="objetivoProfissional"
          rows={3}
          value={formData.objetivoProfissional}
          onChange={handleChange}
          placeholder="Ex: Assumir um escopo de liderança executiva, reposicionar minha carreira para outra área, reencontrar sustentabilidade e ritmo de vida..."
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-charcoal-500 bg-white transition-all focus:outline-none focus:ring-2 ${
            errors.objetivoProfissional
              ? 'border-red-400 focus:ring-red-200'
              : 'border-borderWarm focus:border-sage-700 focus:ring-sage-100'
          }`}
        />
        {errors.objetivoProfissional && (
          <p className="text-[11px] text-red-500 mt-1">{errors.objetivoProfissional}</p>
        )}
      </div>

      {/* Desafio Principal */}
      <div>
        <label htmlFor="form_desafio" className="block text-xs font-semibold text-charcoal-400 mb-1.5">
          Qual é a sua principal dúvida, trava ou desafio atual? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="form_desafio"
          name="desafioPrincipal"
          rows={3}
          value={formData.desafioPrincipal}
          onChange={handleChange}
          placeholder="Ex: Sinto que estou em um teto técnico na empresa atual; dificuldade em negociar limites e prioridades; incerteza sobre qual caminho seguir..."
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-charcoal-500 bg-white transition-all focus:outline-none focus:ring-2 ${
            errors.desafioPrincipal
              ? 'border-red-400 focus:ring-red-200'
              : 'border-borderWarm focus:border-sage-700 focus:ring-sage-100'
          }`}
        />
        {errors.desafioPrincipal && (
          <p className="text-[11px] text-red-500 mt-1">{errors.desafioPrincipal}</p>
        )}
      </div>

      {/* Expectativas e Disponibilidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="form_expectativa" className="block text-xs font-semibold text-charcoal-400 mb-1.5">
            O que você busca na mentoria? <span className="text-charcoal-200 font-normal">(opcional)</span>
          </label>
          <input
            id="form_expectativa"
            name="expectativaMentoria"
            type="text"
            value={formData.expectativaMentoria}
            onChange={handleChange}
            placeholder="Ex: Escuta qualificada, provocação estratégica, plano de ação..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-borderWarm text-xs text-charcoal-500 bg-white focus:border-sage-700 focus:ring-2 focus:ring-sage-100 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="form_disponibilidade" className="block text-xs font-semibold text-charcoal-400 mb-1.5">
            Disponibilidade de Horários
          </label>
          <select
            id="form_disponibilidade"
            name="disponibilidade"
            value={formData.disponibilidade}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-borderWarm text-xs text-charcoal-500 bg-white focus:border-sage-700 focus:ring-2 focus:ring-sage-100 focus:outline-none transition-all"
          >
            <option value="fora_horario_comercial">Disponibilidade fora do horário comercial (noite/sábado)</option>
            <option value="horario_comercial">Disponibilidade em horário comercial</option>
            <option value="flexivel">Flexível / A combinar</option>
          </select>
        </div>
      </div>

      {/* Contexto Adicional */}
      <div>
        <label htmlFor="form_contexto" className="block text-xs font-semibold text-charcoal-400 mb-1.5">
          Algum contexto adicional que queira compartilhar? <span className="text-charcoal-200 font-normal">(opcional)</span>
        </label>
        <textarea
          id="form_contexto"
          name="contextoAdicional"
          rows={2}
          value={formData.contextoAdicional}
          onChange={handleChange}
          placeholder="Algo relevante sobre seu momento atual ou expectativas..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-borderWarm text-xs text-charcoal-500 bg-white focus:border-sage-700 focus:ring-2 focus:ring-sage-100 focus:outline-none transition-all"
        />
      </div>

      {/* Botão de Envio */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl text-xs font-semibold bg-sage-800 hover:bg-sage-900 disabled:opacity-50 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enviando suas informações com segurança...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Enviar Interesse na Mentoria Rumo Works</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-charcoal-200 text-center mt-2.5">
          Suas informações são confidenciais e tratadas estritamente de acordo com nossa política de privacidade.
        </p>
      </div>
    </form>
  );
};
