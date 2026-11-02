export type StudyStatus = 'CURRENTLY_STUDYING' | 'PASSED'

export type SubjectCategory = 'CORE' | 'ELECTIVE' | 'ADDITIONAL' | 'OTHER'

export type StreamType =
  | 'Science'
  | 'Commerce'
  | 'Arts / Humanities'
  | 'Vocational'
  | 'Other'

export interface SubjectItem {
  id: string
  subjectName: string
  subjectCategory: SubjectCategory
  isRequired: boolean
  marksObtained: number | ''
  maximumMarks: number
  grade?: string | null
  isCustom?: boolean
}

export interface CareerPreferences {
  preferredCareers?: string[]
  workEnvironment: string
  careerType: string
  preferredLocation: string
}

export interface AcademicInformationData {
  currentClass: number
  studyStatus: StudyStatus
  passingYear: number | ''
  educationBoard: string
  customBoardName: string
  stream: string
  customStreamName: string
  subjectCombination: string
  subjects: SubjectItem[]
  interests: string[]
  customInterest: string
  technologyInterests: string[]
  careerPreferences: CareerPreferences
}

export interface AcademicFormErrors {
  studyStatus?: string
  passingYear?: string
  educationBoard?: string
  customBoardName?: string
  stream?: string
  customStreamName?: string
  subjectCombination?: string
  subjects?: Record<string, { name?: string; marks?: string; maxMarks?: string }>
  interests?: string
  customInterest?: string
  general?: string
}

export interface AcademicSubmissionPayload {
  studentDetails?: {
    studentName: string
    currentClass: number
    phoneNumber?: string | null
    contactEmail?: string | null
  }
  parentDetails?: {
    fatherName: string
    fatherOccupation?: string | null
    motherName: string
    motherOccupation?: string | null
  }
  academicDetails: {
    educationBoard: string
    stream: string | null
    passingYear: number
    studyStatus: StudyStatus
    subjectCombination?: string | null
    subjects: Array<{
      subjectName: string
      subjectCategory: SubjectCategory
      marksObtained: number
      maximumMarks: number
      grade?: string | null
    }>
    interests?: string[]
    customInterest?: string | null
    technologyInterests?: string[]
    careerPreferences?: CareerPreferences
  }
}
