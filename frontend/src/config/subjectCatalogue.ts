import type { SubjectItem } from '@/types/academicInformation.types'

export const CLASS_10_DEFAULT_SUBJECTS: SubjectItem[] = [
  { id: 'c10_math', subjectName: 'Mathematics', subjectCategory: 'CORE', isRequired: true, marksObtained: '', maximumMarks: 100 },
  { id: 'c10_sci', subjectName: 'Science', subjectCategory: 'CORE', isRequired: true, marksObtained: '', maximumMarks: 100 },
  { id: 'c10_soc', subjectName: 'Social Science', subjectCategory: 'CORE', isRequired: true, marksObtained: '', maximumMarks: 100 },
  { id: 'c10_eng', subjectName: 'English', subjectCategory: 'CORE', isRequired: true, marksObtained: '', maximumMarks: 100 },
  { id: 'c10_lang2', subjectName: 'Second Language', subjectCategory: 'CORE', isRequired: true, marksObtained: '', maximumMarks: 100 },
]

export const COMMON_SUBJECT_CATALOGUE = [
  // Sciences
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'Biotechnology',
  'Computer Science',
  'Informatics Practices',
  'Information Technology',
  'Artificial Intelligence',

  // Commerce & Economics
  'Accountancy',
  'Business Studies',
  'Economics',
  'Applied Mathematics',
  'Financial Markets Management',
  'Entrepreneurship',

  // Humanities / Social Sciences
  'History',
  'Political Science',
  'Geography',
  'Psychology',
  'Sociology',
  'Philosophy',
  'Legal Studies',
  'Home Science',
  'Mass Media Studies',

  // Arts & Aesthetics
  'Painting',
  'Fine Arts',
  'Graphics',
  'Sculpture',
  'Music (Hindustani / Carnatic / Western)',
  'Dance (Kathak / Bharatnatyam)',

  // Languages & Literature
  'English Core',
  'English Elective',
  'Hindi Core',
  'Hindi Elective',
  'Sanskrit',
  'French',
  'German',
  'Spanish',
  'Regional Language',

  // Physical & Vocational
  'Physical Education',
  'Yoga',
  'Tourism',
  'Retail',
  'Automotive',
  'Health Care',
  'Agriculture',
  'Environmental Studies',
] as const
