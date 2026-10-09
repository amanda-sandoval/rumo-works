export type SupportedLanguage = 'en' | 'pt' | 'es';

export interface UserProfileData {
  id?: string;
  name?: string;
  email?: string;
  headline: string;
  summary: string;
  targetLevel: string;
  targetMarkets: string;
  skills: string[];
}

export interface AccomplishmentData {
  id?: string;
  text: string;
  businessProblem?: string;
  actionTaken?: string;
  quantifiedMetric?: string;
  competencies?: string;
  orderIndex?: number;
}

export interface ExperienceData {
  id?: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  teamScope?: string;
  orderIndex?: number;
  accomplishments: AccomplishmentData[];
}

export interface CareerSourceData {
  user: {
    id: string;
    name: string;
    email: string;
    defaultLanguage: string;
  };
  profile: UserProfileData;
  experiences: ExperienceData[];
}

export interface StoryCardData {
  id: string;
  title: string;
  language: string;
  challenge: string;
  action: string;
  impact: string;
  competencies: string[];
  version30s: string;
  version90s: string;
  versionDeepDive: string;
}

export interface CuratedAccomplishment {
  text: string;
  quantifiedMetric?: string;
  sourceStoryTitle?: string;
  relevanceScore: number;
}

export interface CuratedExperience {
  id?: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  teamScope?: string;
  curatedAccomplishments: CuratedAccomplishment[];
}

export interface CuratedCvData {
  name: string;
  email: string;
  headline: string;
  summary: string;
  targetCompany: string;
  targetRole: string;
  language: SupportedLanguage;
  experiences: CuratedExperience[];
  skills: string[];
}

export interface MatchRequirement {
  id: string;
  category: string;
  requirement: string;
  status: 'matched' | 'gap' | 'partial';
  matchedProof?: string;
  missingDetail?: string;
  socraticQuestion?: string;
}

export interface MatchAnalysisResult {
  score: number;
  targetRole: string;
  targetCompany: string;
  language: SupportedLanguage;
  summary: string;
  requirements: MatchRequirement[];
  strengths: string[];
  gaps: {
    area: string;
    missingRequirement: string;
    socraticPrompt: string;
  }[];
  tailoredSuggestions: {
    experienceId?: string;
    originalBullet: string;
    calibratedBullet: string;
    rationale: string;
  }[];
  curatedCvPreview?: CuratedCvData;
}
