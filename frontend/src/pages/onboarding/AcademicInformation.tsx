import React, { useState, useEffect, useTransition } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { CurrentAcademicStatus } from '@/components/onboarding/CurrentAcademicStatus'
import { BoardInformation } from '@/components/onboarding/BoardInformation'
import { StreamSelection } from '@/components/onboarding/StreamSelection'
import { SubjectCombination } from '@/components/onboarding/SubjectCombination'
import { DynamicSubjectSelector } from '@/components/onboarding/DynamicSubjectSelector'
import { SubjectMarksTable } from '@/components/onboarding/SubjectMarksTable'
import { AreasOfInterest } from '@/components/onboarding/AreasOfInterest'
import { CareerPreferences } from '@/components/onboarding/CareerPreferences'
import { JourneyInfoPanel } from '@/components/onboarding/JourneyInfoPanel'
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation'
import { CLASS_10_DEFAULT_SUBJECTS } from '@/config/subjectCatalogue'
import {
  STREAM_COMBINATIONS,
  buildSubjectItemsFromCombination,
} from '@/config/streamConfiguration'
import { validateAcademicInformation } from '@/schemas/academicInformationSchema'
import { onboardingService, OnboardingApiError } from '@/services/onboarding.service'
import { useAuth } from '@/context/AuthContext'
import type {
  AcademicInformationData,
  AcademicFormErrors,
  SubjectItem,
} from '@/types/academicInformation.types'

const ACADEMIC_DRAFT_KEY = 'forkora_academic_information_draft'

function getDefaultClass10Subjects(): SubjectItem[] {
  return [
    ...CLASS_10_DEFAULT_SUBJECTS,
    {
      id: 'c10_additional',
      subjectName: 'Additional Subject',
      subjectCategory: 'ADDITIONAL',
      isRequired: false,
      marksObtained: '',
      maximumMarks: 100,
      isCustom: true,
    },
  ]
}

export function AcademicInformation() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, token } = useAuth()
  const [, startTransition] = useTransition()

  // Determine current class from routing state, query params, user profile, or default to 10
  const classParam = searchParams.get('class')
  const initialClass =
    location.state?.currentClass ||
    (classParam ? Number(classParam) : undefined) ||
    user?.class_level ||
    10

  // Form State (lazy initialized from sessionStorage draft or defaults)
  const [formData, setFormData] = useState<AcademicInformationData>(() => {
    try {
      const saved = sessionStorage.getItem(ACADEMIC_DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...parsed,
          currentClass: initialClass,
        }
      }
    } catch {
      // Fall through to initial state
    }

    const isClass11Or12 = initialClass >= 11
    let initialSubjects = getDefaultClass10Subjects()
    let initialStream = ''
    let initialCombination = ''

    if (isClass11Or12) {
      initialStream = 'Science'
      const pcmComb = STREAM_COMBINATIONS['Science']?.[0]
      initialCombination = pcmComb?.id || ''
      initialSubjects = buildSubjectItemsFromCombination(pcmComb)
    }

    return {
      currentClass: initialClass,
      studyStatus: 'CURRENTLY_STUDYING',
      passingYear: new Date().getFullYear(),
      educationBoard: '',
      customBoardName: '',
      stream: initialStream,
      customStreamName: '',
      subjectCombination: initialCombination,
      subjects: initialSubjects,
      interests: [],
      customInterest: '',
      technologyInterests: [],
      careerPreferences: {
        workEnvironment: 'No preference',
        careerType: 'No preference',
        preferredLocation: 'No preference',
      },
    }
  })

  // Student & Family Profile Context (retrieved from Stage 1 or backend API)
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
    currentClass: initialClass,
  })

  // Feedback and UI States
  const [errors, setErrors] = useState<AcademicFormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Fetch backend existing profile to populate student context and sync class
  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      if (!token) return

      try {
        const existing = await onboardingService.getExistingProfile(token)
        if (isMounted && existing) {
          const sp = existing.studentProfile
          const family = existing.familyProfiles || []

          const enrolledClass = sp?.current_class || initialClass

          setStudentContext({
            studentName: sp?.student_name || user?.display_name || '',
            currentClass: enrolledClass,
            phoneNumber: sp?.phone_number || null,
            contactEmail: sp?.contact_email || null,
            fatherName: sp?.father_name || family[0]?.name || '',
            fatherOccupation: sp?.father_occupation || family[0]?.occupation || '',
            motherName: sp?.mother_name || family[1]?.name || '',
            motherOccupation: sp?.mother_occupation || family[1]?.occupation || '',
          })

          // Ensure form currentClass reflects verified profile class
          setFormData((prev) => {
            if (prev.currentClass !== enrolledClass) {
              const isHsc = enrolledClass >= 11
              let newSubjects = prev.subjects
              let newStream = prev.stream
              let newComb = prev.subjectCombination

              if (!isHsc && prev.currentClass >= 11) {
                newSubjects = getDefaultClass10Subjects()
                newStream = ''
                newComb = ''
              } else if (isHsc && prev.currentClass <= 10) {
                newStream = 'Science'
                const pcm = STREAM_COMBINATIONS['Science']?.[0]
                newComb = pcm?.id || ''
                newSubjects = buildSubjectItemsFromCombination(pcm)
              }

              return {
                ...prev,
                currentClass: enrolledClass,
                stream: newStream,
                subjectCombination: newComb,
                subjects: newSubjects,
              }
            }
            return prev
          })
        }
      } catch {
        // Silently proceed
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [token, initialClass, user])

  // Scroll to focused section if navigated from Review Edit buttons
  useEffect(() => {
    if (location.state?.focusSection) {
      setTimeout(() => {
        let targetId = 'academic-section'
        if (location.state.focusSection === 'interests') targetId = 'interests-section'
        if (location.state.focusSection === 'preferences') targetId = 'preferences-section'
        const el = document.getElementById(targetId)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }, [location.state])

  // Save draft whenever formData changes
  const updateFormData = (updated: Partial<AcademicInformationData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updated }
      try {
        sessionStorage.setItem(ACADEMIC_DRAFT_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage write issues
      }
      return next
    })

    // Clear related validation errors
    setErrors((prev) => {
      const next = { ...prev }
      if (updated.studyStatus) delete next.studyStatus
      if (updated.passingYear) delete next.passingYear
      if (updated.educationBoard) delete next.educationBoard
      if (updated.customBoardName) delete next.customBoardName
      if (updated.stream) delete next.stream
      if (updated.customStreamName) delete next.customStreamName
      if (updated.subjectCombination) delete next.subjectCombination
      if (updated.customInterest) delete next.customInterest
      return next
    })
  }

  // Stream Change Handler (Dynamically switches combinations & updates subjects while preserving marks of common subjects)
  const handleStreamChange = (newStream: string) => {
    const combinations = STREAM_COMBINATIONS[newStream] || STREAM_COMBINATIONS['Other']
    const firstComb = combinations[0]
    const newSubjectsTemplate = buildSubjectItemsFromCombination(firstComb)

    // Preserve existing marks for subjects that remain
    const mergedSubjects: SubjectItem[] = newSubjectsTemplate.map((newSub) => {
      const existingMatch = formData.subjects.find(
        (s) => s.subjectName.toLowerCase() === newSub.subjectName.toLowerCase()
      )
      if (existingMatch && existingMatch.marksObtained !== '') {
        return {
          ...newSub,
          marksObtained: existingMatch.marksObtained,
          maximumMarks: existingMatch.maximumMarks,
        }
      }
      return newSub
    })

    startTransition(() => {
      updateFormData({
        stream: newStream,
        customStreamName: newStream === 'Other' ? formData.customStreamName : '',
        subjectCombination: firstComb?.id || '',
        subjects: mergedSubjects,
      })
    })
  }

  // Subject Combination Change Handler (Preserves matching subject marks)
  const handleCombinationChange = (combinationId: string) => {
    const combinations = STREAM_COMBINATIONS[formData.stream] || STREAM_COMBINATIONS['Other']
    const selectedConfig = combinations.find((c) => c.id === combinationId)
    const newSubjectsTemplate = buildSubjectItemsFromCombination(selectedConfig)

    const mergedSubjects: SubjectItem[] = newSubjectsTemplate.map((newSub) => {
      const existingMatch = formData.subjects.find(
        (s) => s.subjectName.toLowerCase() === newSub.subjectName.toLowerCase()
      )
      if (existingMatch && existingMatch.marksObtained !== '') {
        return {
          ...newSub,
          marksObtained: existingMatch.marksObtained,
          maximumMarks: existingMatch.maximumMarks,
        }
      }
      return newSub
    })

    startTransition(() => {
      updateFormData({
        subjectCombination: combinationId,
        subjects: mergedSubjects,
      })
    })
  }

  // Subject Marks & Max Marks Handlers
  const handleSubjectMarkChange = (subjectId: string, marksObtained: number | '') => {
    const updatedSubjects = formData.subjects.map((sub) => {
      if (sub.id === subjectId) {
        return { ...sub, marksObtained }
      }
      return sub
    })

    updateFormData({ subjects: updatedSubjects })

    // Clear subject mark error if valid
    if (errors.subjects?.[subjectId]?.marks) {
      setErrors((prev) => {
        const nextSubErrors = { ...prev.subjects }
        if (nextSubErrors[subjectId]) {
          const { marks: _, ...rest } = nextSubErrors[subjectId]
          if (Object.keys(rest).length === 0) {
            delete nextSubErrors[subjectId]
          } else {
            nextSubErrors[subjectId] = rest
          }
        }
        return { ...prev, subjects: nextSubErrors }
      })
    }
  }

  const handleSubjectMaxMarksChange = (subjectId: string, maximumMarks: number) => {
    const updatedSubjects = formData.subjects.map((sub) => {
      if (sub.id === subjectId) {
        return { ...sub, maximumMarks }
      }
      return sub
    })

    updateFormData({ subjects: updatedSubjects })
  }

  // Add Dynamic Subject Handler (Prevents duplicates)
  const handleAddSubject = (subjectName: string, category: SubjectItem['subjectCategory'] = 'ELECTIVE') => {
    const isDuplicate = formData.subjects.some(
      (s) => s.subjectName.trim().toLowerCase() === subjectName.trim().toLowerCase()
    )
    if (isDuplicate) return

    const newId = `custom_sub_${Date.now()}`
    const newSub: SubjectItem = {
      id: newId,
      subjectName: subjectName.trim(),
      subjectCategory: category,
      isRequired: false,
      marksObtained: '',
      maximumMarks: 100,
      isCustom: true,
    }

    updateFormData({
      subjects: [...formData.subjects, newSub],
    })
  }

  // Remove Subject Handler (Clears removed subject marks)
  const handleRemoveSubject = (subjectId: string) => {
    const updatedSubjects = formData.subjects.filter((sub) => sub.id !== subjectId)
    updateFormData({ subjects: updatedSubjects })

    // Clean up any errors for the removed subject
    if (errors.subjects?.[subjectId]) {
      setErrors((prev) => {
        const nextSubErrors = { ...prev.subjects }
        delete nextSubErrors[subjectId]
        return { ...prev, subjects: nextSubErrors }
      })
    }
  }

  // Back Navigation Handler (Preserves entered information)
  const handleBack = () => {
    try {
      sessionStorage.setItem(ACADEMIC_DRAFT_KEY, JSON.stringify(formData))
    } catch {
      // Ignore
    }

    navigate('/onboarding', {
      state: {
        fromAcademic: true,
        studentName: studentContext.studentName,
        currentClass: studentContext.currentClass,
      },
    })
  }

  // Submit Handler (Validates & saves through API, then proceeds to Review)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    // Run conditional validation
    const validation = validateAcademicInformation(formData, studentContext)

    if (!validation.isValid || !validation.normalizedPayload) {
      setErrors(validation.errors)

      // Smoothly scroll to the first invalid field
      const firstErrorEl = document.querySelector('[aria-invalid="true"]')
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setIsSubmitting(true)

    try {
      // Submit payload to backend API
      await onboardingService.submitStage2Academic(validation.normalizedPayload, token)
      setIsSuccess(true)

      // Cache updated draft
      try {
        sessionStorage.setItem(ACADEMIC_DRAFT_KEY, JSON.stringify(formData))
      } catch {
        // Ignore
      }

      // Smooth transition to Review stage
      setTimeout(() => {
        navigate(`/onboarding?step=review&class=${formData.currentClass}`, {
          state: {
            academicData: formData,
            studentContext,
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
        {/* Page Heading & Context */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Stage 2 • Academic Information</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Academic Information
          </h1>

          <p className="text-sm sm:text-base text-muted max-w-xl">
            Tell us about your current studies so we can suggest the best career paths for you.
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

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* SECTION 1: Current Academic Status */}
          <CurrentAcademicStatus
            data={formData}
            onChange={updateFormData}
            errors={errors}
            disabled={isSubmitting}
          />

          {/* SECTION 2 & 3: Board & Stream Details */}
          <section id="academic-section" className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                Board & Stream Details
              </h3>
              <p className="text-xs sm:text-sm text-muted">
                Tell us about your board and, if applicable, your stream and subject combination.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
              {/* Education Board (Common to Class 10, 11, 12) */}
              <BoardInformation
                data={formData}
                onChange={updateFormData}
                errors={errors}
                disabled={isSubmitting}
              />

              {/* Conditional Stream Selection (Class 11 and 12 only) */}
              <StreamSelection
                data={formData}
                onStreamChange={handleStreamChange}
                onCustomStreamChange={(customStreamName) => updateFormData({ customStreamName })}
                errors={errors}
                disabled={isSubmitting}
              />

              {/* Conditional Subject Combination (Class 11 and 12 only) */}
              <SubjectCombination
                data={formData}
                onCombinationChange={handleCombinationChange}
                errors={errors}
                disabled={isSubmitting}
              />
            </div>
          </section>

          {/* SECTION 4: Dynamic Subject Selection */}
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
            <DynamicSubjectSelector
              subjects={formData.subjects}
              onAddSubject={handleAddSubject}
              onRemoveSubject={handleRemoveSubject}
              errors={errors}
              disabled={isSubmitting}
            />
          </section>

          {/* SECTION 5: Dynamic Subject Marks */}
          <SubjectMarksTable
            subjects={formData.subjects}
            studyStatus={formData.studyStatus}
            onSubjectMarkChange={handleSubjectMarkChange}
            onSubjectMaxMarksChange={handleSubjectMaxMarksChange}
            errors={errors}
            disabled={isSubmitting}
          />

          {/* SECTION 6: Areas of Interest & Tech Exploration */}
          <div id="interests-section">
            <AreasOfInterest
              data={formData}
              onChange={updateFormData}
              errors={errors}
              disabled={isSubmitting}
            />
          </div>

          {/* SECTION 7: Career Preferences (Optional) */}
          <div id="preferences-section">
            <CareerPreferences
              data={formData}
              onChange={updateFormData}
              disabled={isSubmitting}
            />
          </div>

          {/* Mobile-Only Guidance Box */}
          <div className="lg:hidden p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-2.5">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Your Journey After School</span>
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              Based on your academic performance and interests, Forkora will help you explore suitable streams, top courses (Engineering, CS, AI/ML, Business, Arts), and entrance requirements.
            </p>
          </div>

          {/* SECTION 8: Form Navigation */}
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
