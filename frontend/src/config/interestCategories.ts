export interface AcademicStreamPreference {
  id: string
  label: string
  description: string
}

export const CLASS_10_STREAM_PREFERENCES: readonly AcademicStreamPreference[] = [
  {
    id: 'SCIENCE_PCM',
    label: 'Science – PCM',
    description: 'Physics, Chemistry, Mathematics',
  },
  {
    id: 'SCIENCE_PCB',
    label: 'Science – PCB',
    description: 'Physics, Chemistry, Biology',
  },
  {
    id: 'SCIENCE_PCMB',
    label: 'Science – PCMB',
    description: 'Physics, Chemistry, Mathematics, Biology',
  },
  {
    id: 'COMMERCE_WITH_MATH',
    label: 'Commerce with Mathematics',
    description: 'Commerce subjects with Mathematics',
  },
  {
    id: 'COMMERCE_WITHOUT_MATH',
    label: 'Commerce without Mathematics',
    description: 'Commerce-focused subject combination without Mathematics',
  },
  {
    id: 'ARTS_HUMANITIES',
    label: 'Arts / Humanities',
    description: 'Humanities and social science subjects',
  },
  {
    id: 'VOCATIONAL',
    label: 'Vocational Education',
    description: 'Skill-based and vocational subject combinations',
  },
  {
    id: 'OTHER_UNDECIDED',
    label: 'Other / Undecided',
    description: "Students who are exploring options or haven't decided yet.",
  },
] as const

export function getStreamPreferenceLabel(idOrLabel: string): string {
  const match = CLASS_10_STREAM_PREFERENCES.find(
    (p) => p.id === idOrLabel || p.label.toLowerCase() === idOrLabel.toLowerCase()
  )
  return match ? match.label : idOrLabel
}

export function getStreamPreferenceDescription(idOrLabel: string): string | undefined {
  const match = CLASS_10_STREAM_PREFERENCES.find(
    (p) => p.id === idOrLabel || p.label.toLowerCase() === idOrLabel.toLowerCase()
  )
  return match?.description
}

export function isClass10StreamPreference(idOrLabel: string): boolean {
  return CLASS_10_STREAM_PREFERENCES.some(
    (p) => p.id === idOrLabel || p.label.toLowerCase() === idOrLabel.toLowerCase()
  )
}

export const BROAD_INTEREST_OPTIONS = [
  'Technology & Computers',
  'Science & Innovation',
  'Arts & Design',
  'Business & Entrepreneurship',
  'Healthcare & Medicine',
  'Government & Civil Services',
  'Media & Communication',
  'Law & Justice',
  'Teaching & Education',
  'Sports & Fitness',
  'Agriculture & Environment',
  'Other',
] as const

export const TECHNOLOGY_SUBCATEGORIES = [
  'Software Development',
  'Computer Science',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'Robotics',
  'Game Development',
  'Electronics',
  'Other Technology Interests',
] as const

export const WORK_ENVIRONMENT_OPTIONS = [
  'Office-based',
  'Remote',
  'Hybrid',
  'Field-based',
  'Laboratory / Research',
  'No preference',
] as const

export const CAREER_TYPE_OPTIONS = [
  'Government',
  'Private Sector',
  'Entrepreneurship',
  'Research / Academia',
  'Freelancing / Independent',
  'No preference',
] as const

export const LOCATION_OPTIONS = [
  'India',
  'Abroad',
  'Both',
  'No preference',
] as const

export const EDUCATION_BOARD_OPTIONS = [
  'CBSE',
  'ICSE',
  'State Board',
  'IB',
  'Cambridge / IGCSE',
  'NIOS',
  'Other',
] as const

export const POPULAR_TARGET_CAREERS = [
  'Software Engineer',
  'Doctor',
  'Data Scientist',
  'Chartered Accountant',
  'Corporate Lawyer',
  'Investment Banker',
  'Clinical Psychologist',
  'UI/UX Designer',
  'Mechanical Engineer',
  'Civil Services Officer',
  'Product Manager',
  'AI/ML Research Scientist',
  'Biotechnology Researcher',
  'Aerospace Engineer',
  'Management Consultant',
  'Architect',
] as const
