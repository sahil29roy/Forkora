import type {
  AcademicInformationData,
  AcademicFormErrors,
  AcademicSubmissionPayload,
} from '@/types/academicInformation.types'

export function validateAcademicInformation(
  data: AcademicInformationData,
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
  errors: AcademicFormErrors
  normalizedPayload?: AcademicSubmissionPayload
} {
  const errors: AcademicFormErrors = {}
  const subjectErrors: Record<string, { name?: string; marks?: string; maxMarks?: string }> = {}

  // 1. Study Status Validation
  if (!data.studyStatus) {
    errors.studyStatus = 'Please select your study status (Currently Studying or Passed).'
  }

  // 2. Passing / Expected Year Validation
  if (data.passingYear === '' || data.passingYear === undefined || data.passingYear === null) {
    errors.passingYear =
      data.studyStatus === 'PASSED'
        ? 'Please select the year you passed your examination.'
        : 'Please select your expected passing year.'
  } else {
    const yr = Number(data.passingYear)
    if (!Number.isInteger(yr) || yr < 1990 || yr > 2100) {
      errors.passingYear = 'Please select a valid academic year.'
    }
  }

  // 3. Education Board Validation
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

  // 4. Conditional Stream Selection for Class 11 and Class 12
  const isHigherSecondary = data.currentClass >= 11
  if (isHigherSecondary) {
    const trimmedStream = (data.stream || '').trim()
    if (!trimmedStream) {
      errors.stream = 'Please select your academic stream.'
    } else if (trimmedStream === 'Other') {
      const trimmedCustomStream = (data.customStreamName || '').trim()
      if (!trimmedCustomStream) {
        errors.customStreamName = 'Please specify your stream name.'
      } else if (trimmedCustomStream.length < 2) {
        errors.customStreamName = 'Stream name must be at least 2 characters.'
      }
    }

    if (trimmedStream && !data.subjectCombination) {
      errors.subjectCombination = 'Please select your subject combination.'
    }
  }

  // 5. Subjects & Marks Validation
  if (!data.subjects || data.subjects.length === 0) {
    errors.general = 'Please configure at least one academic subject.'
  } else {
    // Check for duplicate subject names
    const seenNames = new Set<string>()

    for (const sub of data.subjects) {
      const rowErr: { name?: string; marks?: string; maxMarks?: string } = {}
      const trimmedSubName = (sub.subjectName || '').trim().toLowerCase()

      // Empty subject name check
      if (!trimmedSubName) {
        rowErr.name = 'Subject name cannot be empty.'
      } else if (seenNames.has(trimmedSubName)) {
        rowErr.name = `Duplicate subject: "${sub.subjectName}" is already added.`
      } else {
        seenNames.add(trimmedSubName)
      }

      // Maximum marks validation
      const maxMarksNum = Number(sub.maximumMarks)
      if (Number.isNaN(maxMarksNum) || maxMarksNum <= 0) {
        rowErr.maxMarks = 'Max marks must be greater than 0.'
      }

      // Marks obtained validation
      const markVal = sub.marksObtained

      // If Passed: required subjects must have marks
      if (data.studyStatus === 'PASSED' && sub.isRequired && markVal === '') {
        rowErr.marks = `Please enter marks obtained for ${sub.subjectName || 'this subject'}.`
      }

      // If marks are provided
      if (markVal !== '' && markVal !== undefined && markVal !== null) {
        const markNum = Number(markVal)
        if (Number.isNaN(markNum)) {
          rowErr.marks = 'Marks must be a valid number.'
        } else if (markNum < 0) {
          rowErr.marks = 'Marks cannot be negative.'
        } else if (markNum > (sub.maximumMarks || 100)) {
          rowErr.marks = `Marks cannot exceed ${sub.maximumMarks || 100}.`
        }
      }

      if (Object.keys(rowErr).length > 0) {
        subjectErrors[sub.id] = rowErr
      }
    }

    if (Object.keys(subjectErrors).length > 0) {
      errors.subjects = subjectErrors
    }
  }

  // 6. Areas of Interest Validation
  if (data.interests.includes('Other')) {
    const trimmedCustomInterest = (data.customInterest || '').trim()
    if (!trimmedCustomInterest) {
      errors.customInterest = 'Please describe your specific interest.'
    } else if (trimmedCustomInterest.length < 2) {
      errors.customInterest = 'Interest description must be at least 2 characters.'
    }
  }

  const isValid = Object.keys(errors).length === 0

  if (!isValid) {
    return { isValid: false, errors }
  }

  // Normalize Education Board Name
  const resolvedBoardName =
    data.educationBoard === 'Other' ? data.customBoardName.trim() : data.educationBoard.trim()

  // Normalize Stream Name for Backend (mapped to valid standard enum or custom string)
  let resolvedStream: string | null = null
  if (isHigherSecondary) {
    if (data.stream === 'Science') resolvedStream = 'SCIENCE'
    else if (data.stream === 'Commerce') resolvedStream = 'COMMERCE'
    else if (data.stream === 'Arts / Humanities') resolvedStream = 'HUMANITIES'
    else if (data.stream === 'Vocational') resolvedStream = 'VOCATIONAL'
    else if (data.stream === 'Other') resolvedStream = data.customStreamName.trim() || 'OTHER'
    else resolvedStream = data.stream.trim().toUpperCase()
  }

  // Filter valid subjects for submission
  const validSubjects = data.subjects
    .filter((s) => s.subjectName.trim().length > 0)
    .map((s) => ({
      subjectName: s.subjectName.trim(),
      subjectCategory: s.subjectCategory || (s.isRequired ? ('CORE' as const) : ('ELECTIVE' as const)),
      marksObtained: s.marksObtained !== '' ? Number(s.marksObtained) : 0,
      maximumMarks: Number(s.maximumMarks || 100),
      grade: s.grade || null,
    }))

  const normalizedPayload: AcademicSubmissionPayload = {
    ...(studentContext?.studentName
      ? {
          studentDetails: {
            studentName: studentContext.studentName,
            currentClass: studentContext.currentClass || data.currentClass,
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
      stream: resolvedStream,
      passingYear: Number(data.passingYear),
      studyStatus: data.studyStatus,
      subjectCombination: isHigherSecondary ? data.subjectCombination : null,
      subjects: validSubjects,
      interests: data.interests,
      customInterest: data.interests.includes('Other') ? data.customInterest.trim() : null,
      technologyInterests: data.technologyInterests,
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
