export type AssessmentModuleType = 'ACADEMIC' | 'APTITUDE' | 'BEHAVIOURAL' | 'SITUATIONAL';
export type AssessmentAttemptStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type QuestionSourceType = 'CURATED' | 'LLM';

export interface AssessmentModuleRow {
  id: string;
  module_type: AssessmentModuleType;
  title: string;
  description: string;
  instructions: string;
  total_questions: number;
  estimated_duration_minutes: number;
  is_active: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface AssessmentQuestionRow {
  id: number;
  module_id: string;
  source: QuestionSourceType;
  subject?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  class_level?: number | null;
  question_text: string;
  correct_answer?: string | null;
  scoring_rubric?: any;
  generation_metadata?: any;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface AssessmentQuestionOptionRow {
  id: number;
  question_id: number;
  option_text: string;
  option_order: number;
  is_correct: boolean;
  score_value?: number | null;
  score_metadata?: any;
  created_at?: Date | string;
}

export interface AssessmentAttemptRow {
  id: number;
  user_id: number;
  module_id: string;
  status: AssessmentAttemptStatus;
  attempt_number: number;
  total_questions: number;
  answered_count: number;
  score?: number | null;
  score_breakdown?: any;
  started_at?: Date | string | null;
  submitted_at?: Date | string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface AssignedOptionDTO {
  option_id: number | string;
  option_text: string;
  score_value?: number | null;
}

export interface AssessmentAssignedQuestionRow {
  id: number;
  attempt_id: number;
  question_id: number;
  display_order: number;
  assigned_options: AssignedOptionDTO[];
  is_answered: boolean;
  created_at?: Date | string;
}

export interface AssessmentResponseRow {
  id: number;
  attempt_id: number;
  assigned_question_id: number;
  question_id: number;
  selected_option_id?: number | null;
  selected_option_text?: string | null;
  response_value?: number | null;
  is_correct?: boolean | null;
  score_awarded?: number | null;
  answered_at?: Date | string;
  updated_at?: Date | string;
}

export interface AssessmentResultRow {
  id: number;
  attempt_id: number;
  user_id: number;
  module_id: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  summary: any;
  completed_at?: Date | string;
}

/**
 * Client-facing safe question model: strictly contains NO answer keys or scoring rubrics.
 */
export interface ClientSafeQuestion {
  assigned_question_id: number;
  display_order: number;
  question_text: string;
  subject?: string | null;
  topic?: string | null;
  options: {
    option_id: number | string;
    option_text: string;
  }[];
  is_answered: boolean;
  selected_option_id?: number | null;
  selected_option_text?: string | null;
  response_value?: number | null;
}

export interface ModuleProgressDTO {
  module_id: string;
  module_type: AssessmentModuleType;
  title: string;
  description: string;
  instructions: string;
  total_questions: number;
  estimated_duration_minutes: number;
  status: AssessmentAttemptStatus;
  attempt_id?: number | null;
  answered_count: number;
  progress_percentage: number;
  score?: number | null;
  completed_at?: Date | string | null;
}
