export type CareerNodeType = 'EDUCATION_LEVEL' | 'STREAM' | 'EXAM' | 'COURSE' | 'CAREER' | 'SPECIALIZATION';
export type CareerTransitionType = 'ACADEMIC' | 'EXAM' | 'DIRECT' | 'LATERAL' | 'CAREER';
export type CareerReversibility = 'REVERSIBLE' | 'PARTIALLY_REVERSIBLE' | 'LOCKED_IN';
export type CareerEligibilityStatus = 'eligible' | 'conditionally_eligible' | 'not_eligible';

export interface CareerNode {
  id: number;
  code: string;
  title: string;
  node_type: CareerNodeType;
  education_level: string;
  stream: string;
  description: string;
  typical_duration_months: number;
  salary_range_inr: { min: number; max: number; median: number };
  skills: string[];
  relevant_subjects: string[];
  is_published: boolean;
}

export interface CareerEdge {
  id: number;
  from_node_id: number;
  to_node_id: number;
  transition_type: CareerTransitionType;
  reversibility: CareerReversibility;
  min_duration_months: number;
  description: string;
}

export interface CareerRule {
  id: number;
  node_id: number;
  rule_type: 'REQUIRED_SUBJECTS' | 'MIN_MARKS' | 'REQUIRED_STREAM' | 'REQUIRED_EXAM';
  required_stream?: string | null;
  required_subjects: string[];
  min_aggregate_marks?: number | null;
  required_exam_node_id?: number | null;
  description: string;
  is_mandatory: boolean;
}

export interface CareerPathwayNode {
  id: number;
  code: string;
  title: string;
  node_type: CareerNodeType;
  education_level: string;
}

export interface CareerPathway {
  pathway_id?: string;
  title?: string;
  nodes: string[]; // e.g. ["Class 10", "Class 12 Science PCM", "B.Tech CSE", "Software Engineer"]
  node_details?: CareerPathwayNode[];
  total_duration_months?: number;
}

export interface CareerScoreBreakdown {
  ml_score: number;
  academic_score: number;
  aptitude_score: number;
  behavioural_score: number;
  situational_score: number;
  preferences_score: number;
  weights: {
    ml: number;
    academic: number;
    aptitude: number;
    behavioural: number;
    situational: number;
    preferences: number;
  };
}

export interface CareerRecommendationDTO {
  career: string;
  career_code?: string;
  node_id?: number;
  compatibilityScore: number;
  eligibility: CareerEligibilityStatus;
  reasons: string[];
  pathways: CareerPathway[];
  breakdown?: CareerScoreBreakdown;
  salary_range?: { min: number; max: number; median: number };
}

export interface CareerPreferencesInput {
  preferred_careers?: string[];
  interests?: string[];
  work_environment?: string;
  career_type?: string;
  preferred_location?: string;
}
