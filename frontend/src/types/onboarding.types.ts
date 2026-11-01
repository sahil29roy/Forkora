export interface StudentDetails {
  studentName: string
  currentClass: number | ''
  phoneNumber: string
  contactEmail: string
}

export interface ParentDetail {
  name: string
  occupation: string
}

export interface FamilyDetails {
  parent1: ParentDetail
  parent2: ParentDetail
}

export interface Stage1OnboardingData {
  studentDetails: {
    studentName: string
    currentClass: number
    phoneNumber?: string
    contactEmail?: string
  }
  familyDetails: {
    parent1: {
      name: string
      occupation?: string
    }
    parent2: {
      name: string
      occupation?: string
    }
  }
  // Optional flat aliases for backend contract compatibility
  student_name?: string
  current_class?: number
  phone_number?: string | null
  contact_email?: string | null
  parent_1_name?: string
  parent_1_occupation?: string | null
  parent_2_name?: string
  parent_2_occupation?: string | null
}

export interface OnboardingFormErrors {
  studentName?: string
  currentClass?: string
  phoneNumber?: string
  contactEmail?: string
  parent1Name?: string
  parent1Occupation?: string
  parent2Name?: string
  parent2Occupation?: string
  general?: string
}

export interface OnboardingApiResponse<T = any> {
  status: 'success' | 'error'
  message: string
  data?: T
  errors?: Record<string, string[] | string>
}

export type OnboardingStepStatus = 'active' | 'upcoming' | 'completed'

export interface OnboardingStageInfo {
  id: number
  title: string
  subtitle: string
  status: OnboardingStepStatus
}
