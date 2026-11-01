import type { LucideIcon } from 'lucide-react'

export type AssessmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export interface AssessmentModule {
  id: string
  title: string
  description: string
  icon: LucideIcon
  // Optional dynamic metadata fields to be populated by backend API in future integrations
  questionCount?: number
  estimatedDuration?: number // duration in minutes
  status?: AssessmentStatus
  progress?: number // 0-100 percentage
}

export interface AssessmentStatusData {
  overallProgress?: number
  completedModules?: number
  totalModules?: number
  status?: AssessmentStatus
}
