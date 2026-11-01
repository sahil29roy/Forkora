import type { LucideIcon } from 'lucide-react'

export type AssessmentModuleId = 'academic' | 'aptitude' | 'behavioural' | 'situational'

export type AssessmentAttemptStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PREPARING'
  | 'FAILED'

export type AssessmentStatus = AssessmentAttemptStatus

export interface AssessmentStatusData {
  overallProgress?: number
  completedModules?: number
  totalModules?: number
  status?: AssessmentAttemptStatus
}

export interface AssessmentModule {
  id: string
  title: string
  description: string
  icon: LucideIcon
  questionCount?: number
  estimatedDuration?: number
  status?: AssessmentAttemptStatus
  progress?: number
}

export interface ModuleProgressDTO {
  module_id: string
  module_type: string
  title: string
  description: string
  instructions: string
  total_questions: number
  estimated_duration_minutes: number
  status: AssessmentAttemptStatus
  attempt_id?: number | null
  answered_count: number
  progress_percentage: number
  score?: number | null
  completed_at?: string | null
}

export interface ClientSafeOption {
  option_id: number | string
  option_text: string
}

export interface ClientSafeQuestion {
  assigned_question_id: number
  display_order: number
  question_text: string
  subject?: string | null
  topic?: string | null
  scenario_text?: string | null
  category?: string | null
  difficulty?: string | null
  options: ClientSafeOption[]
  is_answered: boolean
  selected_option_id?: number | null
  selected_option_text?: string | null
  response_value?: number | null
}

export interface QuestionsDeliveryPayload {
  attempt_id: number
  module_id: string
  status: AssessmentAttemptStatus
  total_questions: number
  answered_count: number
  questions: ClientSafeQuestion[]
}

export interface SaveResponsePayload {
  assigned_question_id: number
  selected_option_id?: number | null
  selected_option_text?: string | null
  response_value?: number | null
}

export interface SaveResponseResult {
  assigned_question_id: number
  answered_count: number
  total_questions: number
  progress_percentage: number
}

export interface AttemptProgressDTO {
  attemptId: number
  moduleId: string
  status: AssessmentAttemptStatus
  totalQuestions: number
  answeredCount: number
  progressPercentage: number
  startedAt?: string | null
}

export interface AssessmentResultSummary {
  answeredQuestions?: number
  correctAnswers?: number
  totalQuestions?: number
  scorePercentage?: number
  subjectPerformance?: Record<string, { total: number; correct: number; percentage: number }>
  topicPerformance?: Record<string, { total: number; correct: number; percentage: number }>
  dimensionAverages?: Record<string, number>
  dimensionDetails?: Record<string, { totalScore: number; count: number; average: number }>
  individualResponses?: { question_id: number; dimension: string; score: number }[]
  behaviouralSignals?: Record<string, number>
  signalDetails?: Record<string, { total: number; count: number; score: number }>
}

export interface AssessmentResultDTO {
  id: number
  attempt_id: number
  user_id: number
  module_id: string
  total_questions: number
  correct_answers: number
  score_percentage: number
  summary: AssessmentResultSummary
  completed_at: string
}

export interface AssessmentModuleConfig {
  id: AssessmentModuleId
  title: string
  shortTitle: string
  description: string
  badgeLabel: string
  questionCount: number
  estimatedDuration: number
  icon: LucideIcon
}
