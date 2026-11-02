import type {
  StudentDetails,
  FamilyDetails,
  OnboardingFormErrors,
  Stage1OnboardingData,
} from '@/types/onboarding.types'

/**
 * Validates a single field or the complete Stage 1 form according to Forkora specs.
 */
export function validateStudentDetails(
  student: StudentDetails,
  family: FamilyDetails
): {
  isValid: boolean
  errors: OnboardingFormErrors
  normalizedData?: Stage1OnboardingData
} {
  const errors: OnboardingFormErrors = {}

  // 1. Student Name (Required, Trim, Min 2 chars)
  const trimmedStudentName = student.studentName.trim()
  if (!trimmedStudentName) {
    errors.studentName = "Please enter student's full name."
  } else if (trimmedStudentName.length < 2) {
    errors.studentName = 'Student name must be at least 2 characters.'
  }

  // 2. Current Class (Required, Integer 1-12)
  if (student.currentClass === '' || student.currentClass === undefined || student.currentClass === null) {
    errors.currentClass = 'Please select your current class.'
  } else {
    const classNum = Number(student.currentClass)
    if (!Number.isInteger(classNum) || classNum < 1 || classNum > 12) {
      errors.currentClass = 'Current class must be between Class 1 and Class 12.'
    }
  }

  // 3. Phone Number (Optional, validate format only if supplied)
  const trimmedPhone = student.phoneNumber.trim()
  if (trimmedPhone) {
    // Allows optional +, spaces, dashes, parentheses and digits, min 7 digits
    const cleanedDigits = trimmedPhone.replace(/\D/g, '')
    if (cleanedDigits.length < 7 || cleanedDigits.length > 15) {
      errors.phoneNumber = 'Please enter a valid phone number (at least 7 digits).'
    }
  }

  // 4. Contact Email (Required, Trim, Valid Email)
  const trimmedEmail = student.contactEmail.trim()
  if (!trimmedEmail) {
    errors.contactEmail = 'Please enter your email address.'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      errors.contactEmail = 'Please enter a valid email address.'
    }
  }

  // 5. Parent 1 Name (Required, Trim, Min 2 chars)
  const trimmedParent1Name = family.parent1.name.trim()
  if (!trimmedParent1Name) {
    errors.parent1Name = 'Please enter Parent 1 name.'
  } else if (trimmedParent1Name.length < 2) {
    errors.parent1Name = 'Parent 1 name must be at least 2 characters.'
  }

  // 6. Parent 2 Name (Required, Trim, Min 2 chars)
  const trimmedParent2Name = family.parent2.name.trim()
  if (!trimmedParent2Name) {
    errors.parent2Name = 'Please enter Parent 2 name.'
  } else if (trimmedParent2Name.length < 2) {
    errors.parent2Name = 'Parent 2 name must be at least 2 characters.'
  }

  const isValid = Object.keys(errors).length === 0

  if (!isValid) {
    return { isValid: false, errors }
  }

  const classLevel = Number(student.currentClass)

  const normalizedData: Stage1OnboardingData = {
    studentDetails: {
      studentName: trimmedStudentName,
      currentClass: classLevel,
      phoneNumber: trimmedPhone || undefined,
      contactEmail: trimmedEmail || undefined,
    },
    familyDetails: {
      parent1: {
        name: trimmedParent1Name,
        occupation: family.parent1.occupation.trim() || undefined,
      },
      parent2: {
        name: trimmedParent2Name,
        occupation: family.parent2.occupation.trim() || undefined,
      },
    },
    // Flattened aliases for comprehensive backend compatibility
    student_name: trimmedStudentName,
    current_class: classLevel,
    phone_number: trimmedPhone || null,
    contact_email: trimmedEmail || null,
    parent_1_name: trimmedParent1Name,
    parent_1_occupation: family.parent1.occupation.trim() || null,
    parent_2_name: trimmedParent2Name,
    parent_2_occupation: family.parent2.occupation.trim() || null,
  }

  return {
    isValid: true,
    errors: {},
    normalizedData,
  }
}
