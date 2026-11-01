import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { BoardInformationSection } from '@/components/onboarding/BoardInformationSection'
import { SubjectMarksSection } from '@/components/onboarding/SubjectMarksSection'
import { AreasOfInterestSection } from '@/components/onboarding/AreasOfInterestSection'
import { CareerPreferencesSection } from '@/components/onboarding/CareerPreferencesSection'
import { JourneyInfoPanel } from '@/components/onboarding/JourneyInfoPanel'
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation'
import { validateClass10AcademicData, DEFAULT_CLASS_10_SUBJECTS } from '@/validators/class10Academic.schema'
import { onboardingService, OnboardingApiError } from '@/services/onboarding.service'
import { useAuth } from '@/context/AuthContext'
import type {
  Class10AcademicData,
  Class10FormErrors,
  SubjectMarkItem,
} from '@/types/academicOnboarding.types'

export function Class10AcademicInfo() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token } = useAuth()

  // Initial standard subjects for Class 10 (5 required + 1 optional additional subject)
  const initialSubjects: SubjectMarkItem[] = [
    ...DEFAULT_CLASS_10_SUBJECTS.map((sub) => ({
      id: sub.id,
      subjectName: sub.subjectName,
      marksObtained: '' as const,
      maximumMarks: 100,
      isRequired: sub.isRequired,
      category: sub.category,
      isCustomName: false,
    })),
    {
      id: 'additional_subject_1',
      subjectName: 'Additional Subject',
      marksObtained: '' as const,
      maximumMarks: 100,
      isRequired: false,
      category: 'ADDITIONAL',
      isCustomName: true,
    },
  ]

  // Complete Form State (initialized from cached draft or default template)
  const [formData, setFormData] = useState<Class10AcademicData>(() => {
    const cachedDraft = onboardingService.getAcademicDraft()
    if (cachedDraft) {
      return {
        ...cachedDraft,
        subjects: cachedDraft.subjects?.length ? cachedDraft.subjects : initialSubjects,
      }
    }
    return {
      educationBoard: '',
      customBoardName: '',
      passingYear: new Date().getFullYear(),
      subjects: initialSubjects,
      interests: [],
      customInterest: '',
      careerPreferences: {
        workEnvironment: 'No preference',
        careerType: 'No preference',
        preferredLocation: 'No preference',
      },
    }
  })

  // Student & Family Profile context (loaded from Stage 1 or location.state)
  const [studentContext, setStudentContext] = useState<{
    studentName?: string
    currentClass?: number
    phoneNumber?: string | null
    contactEmail?: string | null
    fatherName?: string
    fatherOccupation?: string | null
    motherName?: string
    motherOccupation?: string | null
  }>({
    studentName: location.state?.studentName || user?.display_name || '',
    currentClass: location.state?.currentClass || 10,
  })

  // Feedback and UI States
  const [errors, setErrors] = useState<Class10FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  // Prepopulate saved database record if token is present
  useEffect(() => {
    let isMounted = true

    async function loadBackendData() {
      if (!token) return

      try {
        const existing = await onboardingService.getExistingProfile(token)
        if (isMounted && existing) {
          const sp = existing.studentProfile
          const family = existing.familyProfiles || []
          const record = existing.academicRecord

          // Store student and family context for the full payload
          setStudentContext({
            studentName: sp?.student_name || user?.display_name || '',
            currentClass: sp?.current_class || 10,
            phoneNumber: sp?.phone_number || null,
            contactEmail: sp?.contact_email || null,
            fatherName: sp?.father_name || family[0]?.name || '',
            fatherOccupation: sp?.father_occupation || family[0]?.occupation || '',
            motherName: sp?.mother_name || family[1]?.name || '',
            motherOccupation: sp?.mother_occupation || family[1]?.occupation || '',
          })

          // If backend already has academic records saved and user hasn't modified local draft
          const hasDraft = onboardingService.getAcademicDraft()
          if (record && !hasDraft) {
            setFormData((prev) => {
              const dbSubjects = record.subjects || []
              const mergedSubjects = prev.subjects.map((s) => {
                const match = dbSubjects.find(
                  (dbS: any) =>
                    dbS.subject_name.toLowerCase() === s.subjectName.toLowerCase()
                )
                if (match) {
                  return {
                    ...s,
                    marksObtained: Number(match.marks_obtained),
                    maximumMarks: Number(match.maximum_marks || 100),
                  }
                }
                return s
              })

              return {
                ...prev,
                educationBoard: record.education_board || prev.educationBoard,
                subjects: mergedSubjects,
              }
            })
          }
        }
      } catch {
        // Silently proceed with default / draft state
      }
    }

    loadBackendData()

    return () => {
      isMounted = false
    }
  }, [token, user])

  // Handle Section Updates & Clear Field Errors
  const updateSection = (updated: Partial<Class10AcademicData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updated }
      // Cache draft to sessionStorage on every meaningful user edit
      onboardingService.saveAcademicDraft(next)
      return next
    })

    // Clear specific field errors
    setErrors((prev) => {
      const nextErrors = { ...prev }
      if (updated.educationBoard !== undefined && updated.educationBoard) {
        delete nextErrors.educationBoard
      }
      if (updated.customBoardName !== undefined && updated.customBoardName.trim()) {
        delete nextErrors.customBoardName
      }
      if (updated.passingYear !== undefined && updated.passingYear) {
        delete nextErrors.passingYear
      }
      if (updated.customInterest !== undefined && updated.customInterest.trim()) {
        delete nextErrors.customInterest
      }
      if (updated.subjects) {
        // Clear subject marks errors for subjects that now have valid values
        const currentSubErrors = { ...nextErrors.subjects }
        for (const sub of updated.subjects) {
          if (sub.marksObtained !== '') {
            const num = Number(sub.marksObtained)
            if (!Number.isNaN(num) && num >= 0 && num <= 100) {
              delete currentSubErrors[sub.id]
            }
          }
        }
        nextErrors.subjects = currentSubErrors
      }
      return nextErrors
    })
  }

  // Handle Back Navigation (Preserves all entered data)
  const handleBack = () => {
    // Cache draft first
    onboardingService.saveAcademicDraft(formData)
    // Navigate back to Student Details stage
    navigate('/onboarding', {
      state: {
        fromAcademic: true,
        studentName: studentContext.studentName,
        currentClass: studentContext.currentClass,
      },
    })
  }

  // Handle Form Submission (Continue to Review)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    // Run client-side validation
    const validation = validateClass10AcademicData(formData, studentContext)

    if (!validation.isValid || !validation.normalizedPayload) {
      setErrors(validation.errors)

      // Smoothly scroll to the first field error
      const firstErrorEl = document.querySelector('[aria-invalid="true"]')
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Submit Stage 2 academic data to backend API
      await onboardingService.submitStage2Academic(validation.normalizedPayload, token)
      setIsSuccess(true)

      // 2. Cache updated draft
      onboardingService.saveAcademicDraft(formData)

      // 3. Navigate to Review page
      setTimeout(() => {
        navigate('/onboarding?step=review&branch=class-10&class=10', {
          state: {
            academicData: formData,
            studentContext,
            branch: 'class-10',
          },
        })
      }, 700)
    } catch (err: any) {
      if (err instanceof OnboardingApiError) {
        setServerError(err.message)
      } else {
        setServerError('An unexpected error occurred while saving your academic details. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <OnboardingLayout currentStep="academic" rightPanel={<JourneyInfoPanel />}>
      <div className="w-full space-y-6 sm:space-y-8 animate-fade-in text-left">
        {/* Page Top Heading & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Stage 2 • Academic Pathway</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Class 10th Academic Information
          </h1>

          <p className="text-sm sm:text-base text-muted max-w-xl">
            Tell us about your Class 10th studies and academic stream preferences so we can suggest the best pathways for you.
          </p>
        </div>

        {/* Server Error Alert */}
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
              Academic details saved successfully! Navigating to Review...
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* SECTION 1: Board Information */}
          <BoardInformationSection
            data={formData}
            onChange={updateSection}
            errors={errors}
            disabled={isSubmitting}
          />

          {/* SECTION 2: Subject Marks */}
          <SubjectMarksSection
            subjects={formData.subjects}
            onChange={(updatedSubjects) => updateSection({ subjects: updatedSubjects })}
            errors={errors}
            disabled={isSubmitting}
          />

          {/* SECTION 3: Areas of Interest */}
          <AreasOfInterestSection
            data={formData}
            onChange={updateSection}
            errors={errors}
            disabled={isSubmitting}
          />

          {/* SECTION 4: Career Preferences (Optional) */}
          <CareerPreferencesSection
            data={formData}
            onChange={updateSection}
            disabled={isSubmitting}
          />

          {/* Mobile-only Guidance Section */}
          <div className="lg:hidden p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Your Journey After Class 10th</span>
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              Based on your academic performance and stream preferences, Forkora will suggest streams (Science, Commerce, Arts), explore future options, and check eligibility requirements.
            </p>
          </div>

          {/* SECTION 5: Form Navigation Buttons */}
          <OnboardingNavigation
            onBack={handleBack}
            isSubmitting={isSubmitting}
            submitButtonText="Continue to Review →"
          />
        </form>
      </div>
    </OnboardingLayout>
  )
}
