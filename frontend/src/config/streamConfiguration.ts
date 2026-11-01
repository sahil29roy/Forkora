import type { SubjectItem, StreamType } from '@/types/academicInformation.types'

export const STREAM_OPTIONS: StreamType[] = [
  'Science',
  'Commerce',
  'Arts / Humanities',
  'Vocational',
  'Other',
]

export interface SubjectCombinationConfig {
  id: string
  label: string
  description?: string
  defaultSubjects: Array<{
    subjectName: string
    category: 'CORE' | 'ELECTIVE' | 'ADDITIONAL'
    isRequired: boolean
  }>
}

export const STREAM_COMBINATIONS: Record<string, SubjectCombinationConfig[]> = {
  Science: [
    {
      id: 'science_pcm',
      label: 'PCM — Physics, Chemistry, Mathematics',
      description: 'Engineering, Technology, Architecture, Physical Sciences',
      defaultSubjects: [
        { subjectName: 'Physics', category: 'CORE', isRequired: true },
        { subjectName: 'Chemistry', category: 'CORE', isRequired: true },
        { subjectName: 'Mathematics', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
        { subjectName: 'Computer Science', category: 'ELECTIVE', isRequired: false },
      ],
    },
    {
      id: 'science_pcb',
      label: 'PCB — Physics, Chemistry, Biology',
      description: 'Medicine, Pharmacy, Biotechnology, Life Sciences',
      defaultSubjects: [
        { subjectName: 'Physics', category: 'CORE', isRequired: true },
        { subjectName: 'Chemistry', category: 'CORE', isRequired: true },
        { subjectName: 'Biology', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
        { subjectName: 'Physical Education', category: 'ELECTIVE', isRequired: false },
      ],
    },
    {
      id: 'science_pcmb',
      label: 'PCMB — Physics, Chemistry, Mathematics, Biology',
      description: 'Dual Science pathway open to both Engineering & Medicine',
      defaultSubjects: [
        { subjectName: 'Physics', category: 'CORE', isRequired: true },
        { subjectName: 'Chemistry', category: 'CORE', isRequired: true },
        { subjectName: 'Mathematics', category: 'CORE', isRequired: true },
        { subjectName: 'Biology', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
    {
      id: 'science_other',
      label: 'Other Science Combination',
      description: 'Custom subject combination in Science',
      defaultSubjects: [
        { subjectName: 'Physics', category: 'CORE', isRequired: true },
        { subjectName: 'Chemistry', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
  ],

  Commerce: [
    {
      id: 'commerce_with_math',
      label: 'Commerce with Mathematics',
      description: 'Finance, Economics, Data Analytics, Actuarial Science',
      defaultSubjects: [
        { subjectName: 'Accountancy', category: 'CORE', isRequired: true },
        { subjectName: 'Business Studies', category: 'CORE', isRequired: true },
        { subjectName: 'Economics', category: 'CORE', isRequired: true },
        { subjectName: 'Mathematics', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
    {
      id: 'commerce_without_math',
      label: 'Commerce without Mathematics',
      description: 'Business Management, Marketing, Law, Professional Accounting',
      defaultSubjects: [
        { subjectName: 'Accountancy', category: 'CORE', isRequired: true },
        { subjectName: 'Business Studies', category: 'CORE', isRequired: true },
        { subjectName: 'Economics', category: 'CORE', isRequired: true },
        { subjectName: 'Informatics Practices', category: 'ELECTIVE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
    {
      id: 'commerce_applied_math',
      label: 'Commerce with Applied Mathematics',
      description: 'Practical business mathematics, Statistics, Banking',
      defaultSubjects: [
        { subjectName: 'Accountancy', category: 'CORE', isRequired: true },
        { subjectName: 'Business Studies', category: 'CORE', isRequired: true },
        { subjectName: 'Economics', category: 'CORE', isRequired: true },
        { subjectName: 'Applied Mathematics', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
    {
      id: 'commerce_other',
      label: 'Other Commerce Combination',
      description: 'Custom Commerce subject selection',
      defaultSubjects: [
        { subjectName: 'Accountancy', category: 'CORE', isRequired: true },
        { subjectName: 'Business Studies', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
  ],

  'Arts / Humanities': [
    {
      id: 'arts_psych_econ',
      label: 'Humanities with Psychology & Economics',
      description: 'Behavioral Sciences, Policy, Civil Services, Consulting',
      defaultSubjects: [
        { subjectName: 'History', category: 'CORE', isRequired: true },
        { subjectName: 'Political Science', category: 'CORE', isRequired: true },
        { subjectName: 'Psychology', category: 'CORE', isRequired: true },
        { subjectName: 'Economics', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
    {
      id: 'arts_geo_pol',
      label: 'Humanities with Geography & Sociology',
      description: 'International Relations, Administration, Urban Planning',
      defaultSubjects: [
        { subjectName: 'History', category: 'CORE', isRequired: true },
        { subjectName: 'Political Science', category: 'CORE', isRequired: true },
        { subjectName: 'Geography', category: 'CORE', isRequired: true },
        { subjectName: 'Sociology', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
    {
      id: 'arts_fine_arts',
      label: 'Humanities with Fine Arts / Design',
      description: 'Visual Communication, Design, Architecture, Creative Arts',
      defaultSubjects: [
        { subjectName: 'History', category: 'CORE', isRequired: true },
        { subjectName: 'Fine Arts', category: 'CORE', isRequired: true },
        { subjectName: 'Psychology', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
    {
      id: 'arts_other',
      label: 'Other Humanities Combination',
      description: 'Custom selection of Arts & Humanities subjects',
      defaultSubjects: [
        { subjectName: 'History', category: 'CORE', isRequired: true },
        { subjectName: 'Political Science', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
  ],

  Vocational: [
    {
      id: 'voc_it',
      label: 'Information Technology & Software Applications',
      description: 'Applied computing, web development, IT systems',
      defaultSubjects: [
        { subjectName: 'Information Technology', category: 'CORE', isRequired: true },
        { subjectName: 'Computer Science', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
        { subjectName: 'Applied Mathematics', category: 'ELECTIVE', isRequired: false },
      ],
    },
    {
      id: 'voc_fmm',
      label: 'Financial Markets Management & Banking',
      description: 'Stock markets, mutual funds, corporate finance operations',
      defaultSubjects: [
        { subjectName: 'Financial Markets Management', category: 'CORE', isRequired: true },
        { subjectName: 'Business Studies', category: 'CORE', isRequired: true },
        { subjectName: 'Economics', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
    {
      id: 'voc_tourism',
      label: 'Tourism & Hospitality Operations',
      description: 'Travel management, event planning, hospitality',
      defaultSubjects: [
        { subjectName: 'Tourism', category: 'CORE', isRequired: true },
        { subjectName: 'Business Studies', category: 'CORE', isRequired: true },
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
    {
      id: 'voc_other',
      label: 'Custom Vocational Combination',
      description: 'Custom vocational curriculum',
      defaultSubjects: [
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
  ],

  Other: [
    {
      id: 'other_custom',
      label: 'Custom Stream Combination',
      description: 'Design your own academic subjects list',
      defaultSubjects: [
        { subjectName: 'English Core', category: 'CORE', isRequired: true },
      ],
    },
  ],
}

export function buildSubjectItemsFromCombination(
  combinationConfig: SubjectCombinationConfig | undefined
): SubjectItem[] {
  if (!combinationConfig) return []
  return combinationConfig.defaultSubjects.map((sub, idx) => ({
    id: `sub_${sub.subjectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${idx}`,
    subjectName: sub.subjectName,
    subjectCategory: sub.category,
    isRequired: sub.isRequired,
    marksObtained: '',
    maximumMarks: 100,
    isCustom: false,
  }))
}
