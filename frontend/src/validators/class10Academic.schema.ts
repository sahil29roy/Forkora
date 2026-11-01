import type {
  Class10AcademicData,
  Class10FormErrors,
  Class10AcademicSubmissionPayload,
} from '@/types/academicOnboarding.types'

export const DEFAULT_CLASS_10_SUBJECTS = [
  { id: 'math', subjectName: 'Mathematics', isRequired: true, category: 'CORE' as const },
  { id: 'science', subjectName: 'Science', isRequired: true, category: 'CORE' as const },
  { id: 'social_science', subjectName: 'Social Science', isRequired: true, category: 'CORE' as const },
  { id: 'english', subjectName: 'English', isRequired: true, category: 'CORE' as const },
  { id: 'second_lang', subjectName: 'Second Language', isRequired: true, category: 'CORE' as const },
]

export const EDUCATION_BOARD_OPTIONS = [
  'CBSE',
  'ICSE',
  'State Board',
  'IB',
  'Cambridge / IGCSE',
  'NIOS',
  'Other',
] as const
import { CLASS_10_STREAM_PREFERENCES } from '@/config/interestCategories'
export { CLASS_10_STREAM_PREFERENCES }

export const INTEREST_OPTIONS = [
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

export function validateClass10AcademicData(
  data: Class10AcademicData,
  studentContext?: {
    studentName?: string
    currentClass?: number
    phoneNumber?: string | null
    contactEmail?: string | null
    fatherName?: string
    fatherOccupation?: string | null
    motherName?: string
    motherOccupation?: string | null
  }
): {
  isValid: boolean
  errors: Class10FormErrors
  normalizedPayload?: Class10AcademicSubmissionPayload
} {
  const errors: Class10FormErrors = {}
  const subjectErrors: Record<string, string> = {}

  // 1. Education Board Validation
  const trimmedBoard = (data.educationBoard || '').trim()
  if (!trimmedBoard) {
    errors.educationBoard = 'Please select your education board.'
  } else if (trimmedBoard === 'Other') {
    const trimmedCustomBoard = (data.customBoardName || '').trim()
    if (!trimmedCustomBoard) {
      errors.customBoardName = 'Please enter your education board name.'
    } else if (trimmedCustomBoard.length < 2) {
      errors.customBoardName = 'Board name must be at least 2 characters.'
    }
  }

  // 2. Passing Year Validation
  if (data.passingYear === '' || data.passingYear === undefined || data.passingYear === null) {
    errors.passingYear = 'Please select your passing / expected year.'
  } else {
    const yearNum = Number(data.passingYear)
    if (!Number.isInteger(yearNum) || yearNum < 1990 || yearNum > 2100) {
      errors.passingYear = 'Please select a valid academic passing year.'
    }
  }

  // 3. Subject Marks Validation
  for (const subject of data.subjects) {
    const markVal = subject.marksObtained
    const isCustom = subject.isCustomName || !subject.isRequired

    // If required subject
    if (subject.isRequired) {
      if (markVal === '' || markVal === undefined || markVal === null) {
        subjectErrors[subject.id] = `Please enter marks for ${subject.subjectName}.`
        continue
      }
    }

    // If mark is entered (or required)
    if (markVal !== '' && markVal !== undefined && markVal !== null) {
      const num = Number(markVal)
      if (Number.isNaN(num)) {
        subjectErrors[subject.id] = 'Marks must be a valid number.'
      } else if (num < 0) {
        subjectErrors[subject.id] = 'Marks cannot be negative.'
      } else if (num > (subject.maximumMarks || 100)) {
        subjectErrors[subject.id] = `Marks cannot exceed ${subject.maximumMarks || 100}.`
      }

      // If additional subject has marks entered, ensure name is valid
      if (isCustom && !subject.subjectName.trim()) {
        subjectErrors[subject.id] = 'Please enter subject name for this mark.'
      }
    }
  }

  if (Object.keys(subjectErrors).length > 0) {
    errors.subjects = subjectErrors
  }

  // 4. Areas of Interest Validation
  if (data.interests.includes('Other')) {
    const trimmedCustomInterest = (data.customInterest || '').trim()
    if (!trimmedCustomInterest) {
      errors.customInterest = 'Please tell us about your specific area of interest.'
    } else if (trimmedCustomInterest.length < 2) {
      errors.customInterest = 'Interest description must be at least 2 characters.'
    }
  }

  const isValid = Object.keys(errors).length === 0

  if (!isValid) {
    return { isValid: false, errors }
  }

  // Build normalized payload for backend
  const resolvedBoardName =
    data.educationBoard === 'Other' ? data.customBoardName.trim() : data.educationBoard.trim()

  const validSubjects = data.subjects
    .filter((s) => s.marksObtained !== '' && !Number.isNaN(Number(s.marksObtained)))
    .map((s) => ({
      subjectName: s.subjectName.trim(),
      subjectCategory: s.category || (s.isRequired ? ('CORE' as const) : ('ADDITIONAL' as const)),
      marksObtained: Number(s.marksObtained),
      maximumMarks: Number(s.maximumMarks || 100),
    }))

  const normalizedPayload: Class10AcademicSubmissionPayload = {
    ...(studentContext?.studentName
      ? {
          studentDetails: {
            studentName: studentContext.studentName,
            currentClass: studentContext.currentClass || 10,
            phoneNumber: studentContext.phoneNumber || null,
            contactEmail: studentContext.contactEmail || null,
          },
        }
      : {}),
    ...(studentContext?.fatherName && studentContext?.motherName
      ? {
          parentDetails: {
            fatherName: studentContext.fatherName,
            fatherOccupation: studentContext.fatherOccupation || null,
            motherName: studentContext.motherName,
            motherOccupation: studentContext.motherOccupation || null,
          },
        }
      : {}),
    academicDetails: {
      educationBoard: resolvedBoardName,
      passingYear: Number(data.passingYear),
      subjects: validSubjects,
      interests: data.interests,
      customInterest: data.interests.includes('Other') ? data.customInterest.trim() : null,
      careerPreferences: {
        workEnvironment: data.careerPreferences.workEnvironment || 'No preference',
        careerType: data.careerPreferences.careerType || 'No preference',
        preferredLocation: data.careerPreferences.preferredLocation || 'No preference',
      },
    },
  }

  return {
    isValid: true,
    errors: {},
    normalizedPayload,
  }
}
