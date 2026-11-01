import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { AcademicSummaryBar } from '@/components/onboarding/AcademicSummaryBar'
import { StudentDetailsReview } from '@/components/onboarding/StudentDetailsReview'
import { FatherMotherDetailsReview } from '@/components/onboarding/FatherMotherDetailsReview'
import { AcademicInformationReview } from '@/components/onboarding/AcademicInformationReview'
import { AreasOfInterestReview } from '@/components/onboarding/AreasOfInterestReview'
import { CareerPreferencesReview } from '@/components/onboarding/CareerPreferencesReview'
import { WhatHappensNextPanel } from '@/components/onboarding/WhatHappensNextPanel'
import { ReviewNavigation } from '@/components/onboarding/ReviewNavigation'
import { onboardingService, OnboardingApiError } from '@/services/onboarding.service'
import { useAuth } from '@/context/AuthContext'
import type { OnboardingReviewData } from '@/types/reviewOnboarding.types'
import type { AcademicInformationData } from '@/types/academicInformation.types'

const ACADEMIC_DRAFT_KEY = 'forkora_academic_information_draft'
const STAGE1_DRAFT_KEY = 'forkora_stage1_student_details'

export function ReviewAndConfirm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, token, checkProfile } = useAuth()

  // Class param fallback
  const classParam = searchParams.get('class')
  const initialClass =
    location.state?.currentClass ||
    (classParam ? Number(classParam) : undefined) ||
    user?.class_level ||
    10

  // Review State initialized from navigation state, sessionStorage, or user defaults
  const [reviewData, setReviewData] = useState<OnboardingReviewData>(() => {
    // 1. Check navigation state
    const navAcademic: AcademicInformationData | undefined = location.state?.academicData
    const navStudent = location.state?.studentContext

    // 2. Check sessionStorage academic draft
    let sessionAcademic: AcademicInformationData | null = null
    try {
      const savedAcademic = sessionStorage.getItem(ACADEMIC_DRAFT_KEY)
      if (savedAcademic) {
        sessionAcademic = JSON.parse(savedAcademic)
      }
    } catch {
      // Ignore
    }

    // 3. Check sessionStorage stage 1 draft
    let sessionStage1: any = null
    try {
      const savedStage1 = sessionStorage.getItem(STAGE1_DRAFT_KEY)
      if (savedStage1) {
        sessionStage1 = JSON.parse(savedStage1)
      }
    } catch {
      // Ignore
    }

    const academicSource = navAcademic || sessionAcademic
    const resolvedClass =
      academicSource?.currentClass ||
      navStudent?.currentClass ||
      sessionStage1?.studentDetails?.currentClass ||
      initialClass

    return {
      student: {
        studentName:
          navStudent?.studentName ||
          sessionStage1?.studentDetails?.studentName ||
          user?.display_name ||
          '',
        currentClass: resolvedClass,
        phoneNumber:
          navStudent?.phoneNumber ??
          sessionStage1?.studentDetails?.phoneNumber ??
          null,
        contactEmail:
          navStudent?.contactEmail ??
          sessionStage1?.studentDetails?.contactEmail ??
          null,
        studyStatus: academicSource?.studyStatus || 'CURRENTLY_STUDYING',
        passingYear:
          academicSource?.passingYear || new Date().getFullYear(),
      },
      family: {
        fatherName:
          navStudent?.fatherName ||
          sessionStage1?.familyDetails?.parent1?.name ||
          sessionStage1?.parent_1_name ||
          sessionStage1?.father_name ||
          '',
        fatherOccupation:
          navStudent?.fatherOccupation ||
          sessionStage1?.familyDetails?.parent1?.occupation ||
          sessionStage1?.parent_1_occupation ||
          sessionStage1?.father_occupation ||
          null,
        motherName:
          navStudent?.motherName ||
          sessionStage1?.familyDetails?.parent2?.name ||
          sessionStage1?.parent_2_name ||
          sessionStage1?.mother_name ||
          '',
        motherOccupation:
          navStudent?.motherOccupation ||
          sessionStage1?.familyDetails?.parent2?.occupation ||
          sessionStage1?.parent_2_occupation ||
          sessionStage1?.mother_occupation ||
          null,
      },
      academic: {
        educationBoard: academicSource?.educationBoard || '',
        customBoardName: academicSource?.customBoardName || null,
        stream: academicSource?.stream || null,
        customStreamName: academicSource?.customStreamName || null,
        subjectCombination: academicSource?.subjectCombination || null,
        studyStatus: academicSource?.studyStatus || 'CURRENTLY_STUDYING',
        passingYear:
          academicSource?.passingYear || new Date().getFullYear(),
        subjects: academicSource?.subjects || [],
      },
      interests: {
        selectedInterests: academicSource?.interests || [],
        customInterests: academicSource?.customInterest
          ? [academicSource.customInterest]
          : [],
        technologyInterests: academicSource?.technologyInterests || [],
      },
      careerPreferences: {
        workEnvironment:
          academicSource?.careerPreferences?.workEnvironment || 'No preference',
        careerType:
          academicSource?.careerPreferences?.careerType || 'No preference',
        preferredLocation:
          academicSource?.careerPreferences?.preferredLocation || 'No preference',
      },
    }
  })

  // Feedback and UI States
  const [serverError, setServerError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Fetch PostgreSQL saved profile to hydrate any missing data from DB
  useEffect(() => {
    let isMounted = true

    async function loadBackendProfile() {
      if (!token) return

      try {
        const existing = await onboardingService.getExistingProfile(token)
        if (isMounted && existing) {
          const sp = existing.studentProfile
          const family = existing.familyProfiles || []
          const record = existing.academicRecord

          setReviewData((prev) => {
            const fName =
              sp?.father_name ||
              family.find((f: any) => f.relationship === 'FATHER')?.name ||
              family[0]?.name ||
              prev.family.fatherName
            const fOcc =
              sp?.father_occupation ||
              family.find((f: any) => f.relationship === 'FATHER')?.occupation ||
              family[0]?.occupation ||
              prev.family.fatherOccupation

            const mName =
              sp?.mother_name ||
              family.find((f: any) => f.relationship === 'MOTHER')?.name ||
              family[1]?.name ||
              prev.family.motherName
            const mOcc =
              sp?.mother_occupation ||
              family.find((f: any) => f.relationship === 'MOTHER')?.occupation ||
              family[1]?.occupation ||
              prev.family.motherOccupation

            const enrolledClass = sp?.current_class || prev.student.currentClass

            // Subjects from DB if none in state
            let resolvedSubjects = prev.academic.subjects
            if (
              (!resolvedSubjects || resolvedSubjects.length === 0) &&
              record?.subjects &&
              record.subjects.length > 0
            ) {
              resolvedSubjects = record.subjects.map((s: any) => ({
                id: String(s.id),
                subjectName: s.subject_name,
                subjectCategory: s.subject_category,
                marksObtained: s.marks_obtained,
                maximumMarks: s.maximum_marks,
                grade: s.grade,
              }))
            }

            return {
              ...prev,
              student: {
                ...prev.student,
                studentName: sp?.student_name || prev.student.studentName || user?.display_name || '',
                currentClass: enrolledClass,
                phoneNumber: sp?.phone_number ?? prev.student.phoneNumber,
                contactEmail: sp?.contact_email ?? prev.student.contactEmail,
              },
              family: {
                fatherName: fName,
                fatherOccupation: fOcc,
                motherName: mName,
                motherOccupation: mOcc,
              },
              academic: {
                ...prev.academic,
                educationBoard:
                  prev.academic.educationBoard || record?.education_board || '',
                stream: prev.academic.stream || record?.stream || null,
                subjects: resolvedSubjects,
              },
            }
          })
        }
      } catch {
        // Silently continue with existing review data
      }
    }

    loadBackendProfile()

    return () => {
      isMounted = false
    }
  }, [token, user])

  // Check overall completion state
  const isProfileComplete =
    Boolean(reviewData.student.studentName?.trim()) &&
    Boolean(reviewData.student.currentClass) &&
    Boolean(reviewData.family.fatherName?.trim()) &&
    Boolean(reviewData.family.motherName?.trim()) &&
    Boolean(
      reviewData.academic.customBoardName?.trim() ||
        reviewData.academic.educationBoard?.trim()
    ) &&
    (reviewData.student.currentClass <= 10 ||
      Boolean(
        reviewData.academic.customStreamName?.trim() ||
          reviewData.academic.stream?.trim()
      )) &&
    reviewData.academic.subjects?.length > 0

  // Edit Navigation Handlers
  const handleEditStudent = () => {
    navigate('/onboarding', {
      state: {
        fromReview: true,
        studentName: reviewData.student.studentName,
        currentClass: reviewData.student.currentClass,
        phoneNumber: reviewData.student.phoneNumber,
        contactEmail: reviewData.student.contactEmail,
        fatherName: reviewData.family.fatherName,
        fatherOccupation: reviewData.family.fatherOccupation,
        motherName: reviewData.family.motherName,
        motherOccupation: reviewData.family.motherOccupation,
      },
    })
  }

  const handleEditFamily = () => {
    navigate('/onboarding', {
      state: {
        fromReview: true,
        focusSection: 'family',
        studentName: reviewData.student.studentName,
        currentClass: reviewData.student.currentClass,
        phoneNumber: reviewData.student.phoneNumber,
        contactEmail: reviewData.student.contactEmail,
        fatherName: reviewData.family.fatherName,
        fatherOccupation: reviewData.family.fatherOccupation,
        motherName: reviewData.family.motherName,
        motherOccupation: reviewData.family.motherOccupation,
      },
    })
  }

  const handleEditAcademic = () => {
    navigate(
      `/onboarding?step=academic&class=${reviewData.student.currentClass}`,
      {
        state: {
          fromReview: true,
          focusSection: 'academic',
        },
      }
    )
  }

  const handleEditInterests = () => {
    navigate(
      `/onboarding?step=academic&class=${reviewData.student.currentClass}`,
      {
        state: {
          fromReview: true,
          focusSection: 'interests',
        },
      }
    )
  }

  const handleEditCareerPreferences = () => {
    navigate(
      `/onboarding?step=academic&class=${reviewData.student.currentClass}`,
      {
        state: {
          fromReview: true,
          focusSection: 'preferences',
        },
      }
    )
  }

  const handleBackToAcademic = () => {
    navigate(
      `/onboarding?step=academic&class=${reviewData.student.currentClass}`,
      {
        state: {
          fromReview: true,
        },
      }
    )
  }

  // Final Confirmation Handler
  const handleConfirmAndContinue = async () => {
    setServerError(null)
    setValidationError(null)

    // 1. Client-Side Validation of Required Fields
    if (!reviewData.student.studentName?.trim()) {
      setValidationError('Student name is required. Please edit Student Details.')
      return
    }
    if (!reviewData.student.currentClass) {
      setValidationError('Current class is required.')
      return
    }
    if (!reviewData.family.fatherName?.trim()) {
      setValidationError("Father's name is required. Please edit Father & Mother Details.")
      return
    }
    if (!reviewData.family.motherName?.trim()) {
      setValidationError("Mother's name is required. Please edit Father & Mother Details.")
      return
    }
    const resolvedBoard =
      reviewData.academic.customBoardName?.trim() ||
      reviewData.academic.educationBoard?.trim()
    if (!resolvedBoard) {
      setValidationError('Education board is required. Please edit Academic Information.')
      return
    }

    if (reviewData.student.currentClass >= 11) {
      const resolvedStream =
        reviewData.academic.customStreamName?.trim() ||
        reviewData.academic.stream?.trim()
      if (!resolvedStream) {
        setValidationError('Stream is required for Class 11 and 12 students. Please edit Academic Information.')
        return
      }
    }

    if (!reviewData.academic.subjects || reviewData.academic.subjects.length === 0) {
      setValidationError('At least one subject must be recorded. Please edit Academic Information.')
      return
    }

    setIsSubmitting(true)

    // 2. Build backend-compliant payload
    const submissionPayload = {
      student_name: reviewData.student.studentName.trim(),
      current_class: Number(reviewData.student.currentClass),
      phone_number: reviewData.student.phoneNumber?.trim() || null,
      contact_email: reviewData.student.contactEmail?.trim() || null,
      father_name: reviewData.family.fatherName.trim(),
      father_occupation: reviewData.family.fatherOccupation?.trim() || null,
      mother_name: reviewData.family.motherName.trim(),
      mother_occupation: reviewData.family.motherOccupation?.trim() || null,
      education_board: resolvedBoard,
      stream:
        reviewData.student.currentClass >= 11
          ? reviewData.academic.customStreamName?.trim() ||
            reviewData.academic.stream?.trim() ||
            null
          : null,
      subjects: reviewData.academic.subjects.map((sub) => {
        const marksNum =
          sub.marksObtained !== '' &&
          sub.marksObtained !== null &&
          sub.marksObtained !== undefined
            ? Number(sub.marksObtained)
            : 0
        const maxMarksNum = Number(sub.maximumMarks) || 100

        return {
          subject_name: sub.subjectName.trim(),
          subject_category: (sub.subjectCategory || 'CORE').toUpperCase(),
          marks_obtained: marksNum,
          maximum_marks: maxMarksNum,
          grade: sub.grade || null,
        }
      }),
      // Additional rich academic fields preserved
      academicDetails: {
        educationBoard: resolvedBoard,
        stream:
          reviewData.student.currentClass >= 11
            ? reviewData.academic.stream
            : null,
        passingYear: Number(reviewData.student.passingYear),
        studyStatus: reviewData.student.studyStatus,
        subjectCombination: reviewData.academic.subjectCombination,
        subjects: reviewData.academic.subjects,
        interests: reviewData.interests.selectedInterests,
        customInterest: reviewData.interests.customInterests?.[0] || null,
        technologyInterests: reviewData.interests.technologyInterests,
        careerPreferences: reviewData.careerPreferences,
      },
    }

    try {
      // 3. Submit final payload to backend API (sets is_completed: true)
      await onboardingService.submitStage2Academic(submissionPayload, token)
      setIsSuccess(true)

      // Refresh Auth profile to mark onboarding as completed in user context
      if (checkProfile) {
        await checkProfile()
      }

      // Smooth transition to Assessment Introduction page
      setTimeout(() => {
        navigate('/assessment/intro')
      }, 700)
    } catch (err: any) {
      if (err instanceof OnboardingApiError) {
        setServerError(err.message)
      } else {
        setServerError('An unexpected error occurred while confirming your profile. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <OnboardingLayout currentStep="review" rightPanel={<WhatHappensNextPanel />}>
      <div className="w-full space-y-6 sm:space-y-8 animate-fade-in text-left">
        {/* Page Top Heading & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Stage 3 • Review & Confirm</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Review & Confirm
          </h1>

          <p className="text-sm sm:text-base text-muted max-w-xl">
            Please review your information before completing your onboarding.
          </p>
        </div>

        {/* Server or Validation Errors */}
        {validationError && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs sm:text-sm font-medium">
              {validationError}
            </AlertDescription>
          </Alert>
        )}

        {serverError && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs sm:text-sm font-medium">
              {serverError}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <Alert className="border-success/30 bg-success/10 text-success animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs sm:text-sm font-medium">
              Profile confirmed successfully! Navigating to your career assessment...
            </AlertDescription>
          </Alert>
        )}

        {/* Top Academic Summary Bar */}
        <AcademicSummaryBar
          currentClass={reviewData.student.currentClass}
          educationBoard={reviewData.academic.educationBoard}
          customBoardName={reviewData.academic.customBoardName}
          stream={reviewData.academic.stream}
          customStreamName={reviewData.academic.customStreamName}
          subjectCombination={reviewData.academic.subjectCombination}
          passingYear={reviewData.student.passingYear}
          isComplete={isProfileComplete}
        />

        {/* Section 1: Student Details */}
        <StudentDetailsReview
          student={reviewData.student}
          onEdit={handleEditStudent}
        />

        {/* Section 2: Father & Mother Details */}
        <FatherMotherDetailsReview
          family={reviewData.family}
          onEdit={handleEditFamily}
        />

        {/* Section 3: Academic Information */}
        <AcademicInformationReview
          currentClass={reviewData.student.currentClass}
          academic={reviewData.academic}
          onEdit={handleEditAcademic}
        />

        {/* Section 4: Areas of Interest / Academic Stream Preferences */}
        <AreasOfInterestReview
          currentClass={reviewData.student.currentClass}
          interests={reviewData.interests}
          onEdit={handleEditInterests}
        />

        {/* Section 5: Career Preferences (Optional) */}
        <CareerPreferencesReview
          careerPreferences={reviewData.careerPreferences}
          onEdit={handleEditCareerPreferences}
        />

        {/* Mobile-Only What Happens Next Guidance */}
        <div className="lg:hidden p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-2.5">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>What Happens Next?</span>
          </h4>
          <p className="text-xs text-muted leading-relaxed">
            Your academic profile will be saved, followed by a short 15-minute guided career assessment to discover personalized pathways, course options, and eligibility.
          </p>
        </div>

        {/* Bottom Navigation */}
        <ReviewNavigation
          onBack={handleBackToAcademic}
          onConfirm={handleConfirmAndContinue}
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
        />
      </div>
    </OnboardingLayout>
  )
}
