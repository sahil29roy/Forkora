export type CareerEligibilityStatus = 'eligible' | 'conditionally_eligible' | 'not_eligible' | 'unknown';

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

export interface CareerPathway {
  pathway_id: string;
  title: string;
  nodes: string[];
  total_duration_months: number;
}

export interface CareerRecommendationItem {
  career: string;
  career_code: string;
  node_id: number;
  compatibilityScore: number;
  eligibility: CareerEligibilityStatus;
  reasons: string[];
  pathways: CareerPathway[];
  breakdown: CareerScoreBreakdown;
  salary_range_inr?: { min: number; max: number; median: number };
  skills?: string[];
  description?: string;
  domain?: string;
}

export interface CareerRecommendationsResponse {
  total_recommendations: number;
  student_level: string;
  recommendations: CareerRecommendationItem[];
}

export interface CareerPreferencesData {
  preferred_careers: string[];
  interests: string[];
  work_environment: string;
  career_type: string;
  preferred_location: string;
}

export interface AssessmentOverviewMetric {
  id: string;
  name: string;
  scoreText: string;
  scoreValue: number;
  maxValue: number;
  status: 'completed' | 'in_progress' | 'not_started';
  icon: string;
}
