export interface SubjectMarkItem {
  id: string
  subjectName: string
  marksObtained: number | ''
  maximumMarks: number
  isRequired: boolean
  category: 'CORE' | 'ELECTIVE' | 'ADDITIONAL' | 'OTHER'
  isCustomName?: boolean
}

export interface CareerPreferences {
  workEnvironment: string
  careerType: string
  preferredLocation: string
}

export interface Class10AcademicData {
  educationBoard: string
  customBoardName: string
  passingYear: number | ''
  subjects: SubjectMarkItem[]
  interests: string[]
  customInterest: string
  careerPreferences: CareerPreferences
}

export interface Class10FormErrors {
  educationBoard?: string
  customBoardName?: string
  passingYear?: string
  subjects?: Record<string, string>
  interests?: string
  customInterest?: string
  general?: string
}

export interface Class10AcademicSubmissionPayload {
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
    passingYear: number
    subjects: Array<{
      subjectName: string
      subjectCategory: 'CORE' | 'ELECTIVE' | 'ADDITIONAL' | 'OTHER'
      marksObtained: number
      maximumMarks: number
    }>
    interests?: string[]
    customInterest?: string | null
    careerPreferences?: CareerPreferences
  }
}
