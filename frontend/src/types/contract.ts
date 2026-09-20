export type FormulationCategory =
  | 'classical_generic'
  | 'proprietary_ayurvedic'
  | 'new_non_classical_drug'
  | 'phytopharmaceutical'
  | 'ayurveda_aahar_nutraceutical'
  | 'cosmetic';

export interface Citation {
  sourceId: string;
  document: string;
  clauseLabel: string;
  sourceUrl?: string;
  snippet?: string;
  year?: string | number;
  verified?: boolean;
  source_type?: 'corpus' | 'web';
}


export interface SupersessionPath {
  original: string;
  current: string;
  path: string[];
}

export interface ProductContext {
  productName: string;
  whatItDoes: string;
  intendedUse: string;
  ingredients: string[];
  formulationProcess: string;
  inClassicalText?: boolean;
  intendedAsFood?: boolean;
  cosmeticOnly?: boolean;
  hasClinicalEvidence?: boolean;
  isStandardisedExtract?: boolean;
  containsScheduleE?: boolean;
}

export interface RegulatoryQueryRequest {
  query: string;
  jurisdiction: 'IN' | 'INTL';
  language?: 'en' | 'hi' | 'sa' | 'ta';
  session_id?: string;
  productContext?: ProductContext;
}

export interface RegulatoryQueryResponse {
  answer: string;
  confidence: {
    score: number;
    level: 'high' | 'medium' | 'low';
  };
  citations: Citation[];
  supersession_paths?: SupersessionPath[];
  disclaimer?: string;
  nextAction?: {
    label: string;
    route: string;
  };
  reasoningSteps?: {
    title: string;
    description: string;
    status: 'completed' | 'active' | 'pending';
  }[];
  abstain?: boolean;
  missingGaps?: string[];
}

export interface RegulatoryMapData {
  ipProtection: {
    summary: string;
    points: string[];
    citations: Citation[];
  };
  traditionalKnowledge: {
    summary: string;
    priorArtStatus: string;
    tkdlStatus: string;
    citations: Citation[];
  };
  absCompliance: {
    summary: string;
    applicable: boolean;
    requirements: string[];
    authority: string;
    citations: Citation[];
  };
  international?: {
    treaties: string[];
    guidance: string;
    citations: Citation[];
  };
}

export interface Case {
  id: string;
  productName: string;
  createdAt: string;
  updatedAt: string;
  jurisdiction: 'IN' | 'INTL';
  category: FormulationCategory;
  categoryLabel: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  context: ProductContext;
  regulatoryMap: RegulatoryMapData;
  actionPlan: ActionItem[];
  expertReviewRequested?: boolean;
  status: 'active' | 'review' | 'completed';
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: 'IP' | 'TK' | 'ABS' | 'Regulatory';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  statutoryReference?: string;
}

export interface RegulatoryUpdate {
  id: string;
  title: string;
  date: string;
  sourceBadge: string;
  summary: string;
  impactCases?: string[];
  fullTextUrl?: string;
}

export interface OnboardingProfile {
  name: string;
  userType: string;
  goals: string[];
  language: string;
  guidancePreference: 'plain' | 'legal' | 'balanced';
}
