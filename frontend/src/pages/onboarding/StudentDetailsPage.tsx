import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { StudentDetailsForm } from '@/components/onboarding/StudentDetailsForm'
import { ParentDetailsSection } from '@/components/onboarding/ParentDetailsSection'
import { validateStudentDetails } from '@/validators/onboarding.schema'
import { onboardingService, OnboardingApiError } from '@/services/onboarding.service'
import { useAuth } from '@/context/AuthContext'
import type {
  StudentDetails,
  FamilyDetails,
  OnboardingFormErrors,
} from '@/types/onboarding.types'

const STAGE1_DRAFT_KEY = 'forkora_stage1_student_details'

export function StudentDetailsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token } = useAuth()

  // Section A State: Student Details (initialized from location.state or sessionStorage draft)
  const [studentDetails, setStudentDetails] = useState<StudentDetails>(() => {
    if (location.state?.studentName || location.state?.currentClass) {
      return {
        studentName: location.state.studentName || user?.display_name || '',
        currentClass: location.state.currentClass || '',
        phoneNumber: location.state.phoneNumber || '',
        contactEmail: location.state.contactEmail || '',
      }
    }
    try {
      const saved = sessionStorage.getItem(STAGE1_DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.studentDetails) return parsed.studentDetails
      }
    } catch {
      // Ignore
    }
    return {
      studentName: user?.display_name || '',
      currentClass: '',
      phoneNumber: '',
      contactEmail: '',
    }
  })

  // Section B State: Parent / Guardian Details (initialized from location.state or draft)
  const [familyDetails, setFamilyDetails] = useState<FamilyDetails>(() => {
    if (location.state?.fatherName || location.state?.motherName) {
      return {
        parent1: {
          name: location.state.fatherName || '',
          occupation: location.state.fatherOccupation || '',
        },
        parent2: {
          name: location.state.motherName || '',
          occupation: location.state.motherOccupation || '',
        },
      }
    }
    try {
      const saved = sessionStorage.getItem(STAGE1_DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.familyDetails) return parsed.familyDetails
      }
    } catch {
      // Ignore
    }
    return {
      parent1: {
        name: '',
        occupation: '',
      },
      parent2: {
        name: '',
        occupation: '',
      },
    }
  })

  // Form State
  const [errors, setErrors] = useState<OnboardingFormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true)

  // Prepopulate if previously saved draft/profile exists in PostgreSQL
  useEffect(() => {
    let isMounted = true

    async function loadSavedData() {
      if (!token) {
        setIsLoadingProfile(false)
        return
      }

      try {
        const existing = await onboardingService.getExistingProfile(token)
        if (isMounted && existing?.studentProfile) {
          const sp = existing.studentProfile
          setStudentDetails((prev) => ({
            ...prev,
            studentName: sp.student_name || prev.studentName,
            currentClass: sp.current_class ?? prev.currentClass,
            phoneNumber: sp.phone_number || prev.phoneNumber,
            contactEmail: sp.contact_email || prev.contactEmail,
          }))

          if (existing.familyProfiles && Array.isArray(existing.familyProfiles)) {
            const p1 = existing.familyProfiles[0]
            const p2 = existing.familyProfiles[1]

            setFamilyDetails({
              parent1: {
                name: p1?.name || sp.father_name || '',
                occupation: p1?.occupation || sp.father_occupation || '',
              },
              parent2: {
                name: p2?.name || sp.mother_name || '',
                occupation: p2?.occupation || sp.mother_occupation || '',
              },
            })
          }
        }
      } catch {
        // Silently continue with initial state
      } finally {
        if (isMounted) setIsLoadingProfile(false)
      }
    }

    loadSavedData()
    return () => {
      isMounted = false
    }
  }, [token])

  // Clear specific field errors when user edits
  const handleStudentChange = (updated: StudentDetails) => {
    setStudentDetails(updated)
    setErrors((prev) => {
      const next = { ...prev }
      if (updated.studentName.trim().length >= 2) delete next.studentName
      if (updated.currentClass !== '') delete next.currentClass
      if (updated.phoneNumber.trim()) delete next.phoneNumber
      if (updated.contactEmail.trim()) delete next.contactEmail
      return next
    })
  }

  const handleFamilyChange = (updated: FamilyDetails) => {
    setFamilyDetails(updated)
    setErrors((prev) => {
      const next = { ...prev }
      if (updated.parent1.name.trim().length >= 2) delete next.parent1Name
      if (updated.parent2.name.trim().length >= 2) delete next.parent2Name
      return next
    })
  }

  // Auto-scroll to family section if navigated from Father & Mother Details edit
  useEffect(() => {
    if (location.state?.focusSection === 'family') {
      setTimeout(() => {
        const el = document.getElementById('family-details-section')
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [location.state])

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    // Run client-side validation
    const validation = validateStudentDetails(studentDetails, familyDetails)

    if (!validation.isValid || !validation.normalizedData) {
      setErrors(validation.errors)
      // Scroll to the first error smoothly
      const firstErrorKey = Object.keys(validation.errors)[0]
      if (firstErrorKey) {
        const errorEl = document.querySelector('[aria-invalid="true"]')
        errorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Submit Stage 1 data to backend API
      await onboardingService.submitStage1(validation.normalizedData, token)
      setIsSuccess(true)

      // Cache stage 1 draft
      try {
        sessionStorage.setItem(
          STAGE1_DRAFT_KEY,
          JSON.stringify({ studentDetails, familyDetails })
        )
      } catch {
        // Ignore
      }

      // 2. Class-Based Next Step Navigation
      const selectedClass = Number(studentDetails.currentClass)
      const targetAcademicBranch = selectedClass <= 10 ? 'class-10' : 'class-12'

      // Smooth transition to allow the user to see the success state
      setTimeout(() => {
        if (location.state?.fromReview) {
          navigate(`/onboarding?step=review&class=${selectedClass}`)
        } else {
          navigate(`/onboarding?step=academic&branch=${targetAcademicBranch}&class=${selectedClass}`, {
            state: {
              studentName: studentDetails.studentName,
              currentClass: selectedClass,
              branch: targetAcademicBranch,
            },
          })
        }
      }, 700)
    } catch (err: any) {
      if (err instanceof OnboardingApiError) {
        setServerError(err.message)
      } else {
        setServerError('An unexpected error occurred while saving your details. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <OnboardingLayout currentStep="details">
      <div className="w-full space-y-6 sm:space-y-8 animate-fade-in text-left">
        {/* Page Top Heading & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Academic Onboarding</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Let's get to know you
          </h1>
          <p className="text-sm sm:text-base text-muted max-w-xl">
            Tell us a little about yourself and your family to help us create a more relevant academic journey.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs sm:text-sm font-medium">
              {serverError}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <Alert className="border-success/30 bg-success/10 text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs sm:text-sm font-medium">
              Details saved successfully! Proceeding...
            </AlertDescription>
          </Alert>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* SECTION A: Student Details */}
          <StudentDetailsForm
            studentDetails={studentDetails}
            onChange={handleStudentChange}
            errors={errors}
            disabled={isSubmitting || isLoadingProfile}
          />

          {/* SECTION B: Parent / Guardian Details */}
          <div id="family-details-section">
            <ParentDetailsSection
              familyDetails={familyDetails}
              onChange={handleFamilyChange}
              errors={errors}
              disabled={isSubmitting || isLoadingProfile}
            />
          </div>

          {/* Submit Action Area */}
          <div className="pt-2 sm:pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted text-center sm:text-left">
              Step 1 of 3: Next is your academic history & subjects.
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isSuccess || isLoadingProfile}
              className="w-full sm:w-auto h-11 px-8 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm shadow-primary/25 hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving details...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verified!</span>
                </>
              ) : (
                <>
                  <span>Continue to Academic Info</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  )
}
