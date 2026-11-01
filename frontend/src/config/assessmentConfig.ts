import { BookOpen, BrainCircuit, HeartHandshake, Briefcase } from 'lucide-react'
import type { AssessmentModuleConfig, AssessmentModuleId } from '@/types/assessment.types'

export const ASSESSMENT_MODULE_CONFIGS: Record<AssessmentModuleId, AssessmentModuleConfig> = {
  academic: {
    id: 'academic',
    title: 'Academic Assessment',
    shortTitle: 'Academic',
    description: 'Subject knowledge and academic interests.',
    badgeLabel: '10 Questions',
    questionCount: 10,
    estimatedDuration: 15,
    icon: BookOpen,
  },
  aptitude: {
    id: 'aptitude',
    title: 'Aptitude Assessment',
    shortTitle: 'Aptitude',
    description: 'Reasoning, problem-solving and analytical skills.',
    badgeLabel: '10 Questions',
    questionCount: 10,
    estimatedDuration: 15,
    icon: BrainCircuit,
  },
  behavioural: {
    id: 'behavioural',
    title: 'Behavioural Assessment',
    shortTitle: 'Behavioural',
    description: 'Habits, preferences and working style.',
    badgeLabel: '10 Statements',
    questionCount: 10,
    estimatedDuration: 10,
    icon: HeartHandshake,
  },
  situational: {
    id: 'situational',
    title: 'Situational Assessment',
    shortTitle: 'Situational',
    description: 'Real-life situations and decision-making approaches.',
    badgeLabel: '5 Scenarios',
    questionCount: 5,
    estimatedDuration: 10,
    icon: Briefcase,
  },
}

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither Agree nor Disagree' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
] as const
