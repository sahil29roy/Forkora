import type { StudyStatus } from './academicInformation.types'

export interface ReviewStudentData {
  studentName: string
  currentClass: number
  phoneNumber?: string | null
  contactEmail?: string | null
  studyStatus: StudyStatus
  passingYear: number | string
}

export interface ReviewFamilyData {
  fatherName: string
  fatherOccupation?: string | null
  motherName: string
  motherOccupation?: string | null
}

export interface ReviewSubjectRecord {
  id?: string
  subjectName: string
  subjectCategory?: string
  marksObtained?: number | string | null
  maximumMarks?: number | null
  grade?: string | null
  isRequired?: boolean
  isCustom?: boolean
}

export interface ReviewAcademicData {
  educationBoard: string
  customBoardName?: string | null
  stream?: string | null
  customStreamName?: string | null
  subjectCombination?: string | null
  studyStatus: StudyStatus
  passingYear: number | string
  subjects: ReviewSubjectRecord[]
}

export interface ReviewInterestsData {
  selectedInterests: string[]
  customInterests?: string[]
  technologyInterests?: string[]
}

export interface ReviewCareerPreferencesData {
  preferredCareers?: string[]
  workEnvironment?: string | null
  careerType?: string | null
  preferredLocation?: string | null
}

export interface OnboardingReviewData {
  student: ReviewStudentData
  family: ReviewFamilyData
  academic: ReviewAcademicData
  interests: ReviewInterestsData
  careerPreferences: ReviewCareerPreferencesData
}
