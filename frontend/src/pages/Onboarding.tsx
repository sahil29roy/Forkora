import { useSearchParams, useNavigate } from 'react-router-dom'
import { StudentDetailsPage } from './onboarding/StudentDetailsPage'
import { Class10AcademicInfo } from './onboarding/Class10AcademicInfo'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { BookOpen, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Onboarding() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const step = searchParams.get('step')
  const branch = searchParams.get('branch')
  const classLevel = searchParams.get('class')

  // When navigated to Stage 2: Academic Info branch
  if (step === 'academic') {
    const isHigherSecondary = branch === 'class-12' || (classLevel && Number(classLevel) > 10)

    if (isHigherSecondary) {
      return (
        <OnboardingLayout currentStep="academic">
          <div className="w-full space-y-6 sm:space-y-8 animate-fade-in text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Stage 2 • Academic Pathway</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                Class 12 Academic Information
              </h1>
              <p className="text-sm sm:text-base text-muted max-w-xl">
                Your personal and parent details have been recorded. You are routed to Branch B (Higher Secondary Stream Selection & Subject Combinations).
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    Branch B: Class 11-12 Streams
                  </h4>
                  <p className="text-xs text-muted">
                    Higher secondary stream configuration will be implemented in the next phase.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/onboarding')}
                  className="gap-2 text-xs sm:text-sm font-semibold rounded-lg border-border"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Student & Parent Details</span>
                </Button>
              </div>
            </div>
          </div>
        </OnboardingLayout>
      )
    }

    // Default Academic Step: Class 10th Academic Information
    return <Class10AcademicInfo />
  }

  // When navigated to Stage 3: Review & Confirm placeholder
  if (step === 'review') {
    return (
      <OnboardingLayout currentStep="review">
        <div className="w-full space-y-6 sm:space-y-8 animate-fade-in text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Stage 3 • Review & Confirm</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Review & Finalize Your Pathway
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-xl">
              Your Class 10th academic details and career interests have been recorded. Review stage will assemble your full profile before generating career graphs.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">
                  Academic Information Successfully Saved
                </h4>
                <p className="text-xs text-muted">
                  Stage 1 and Stage 2 have been validated and saved.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/onboarding?step=academic&branch=class-10&class=10')}
                className="gap-2 text-xs sm:text-sm font-semibold rounded-lg border-border"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Academic Info</span>
              </Button>

              <Button
                onClick={() => navigate('/dashboard')}
                className="gap-2 text-xs sm:text-sm font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <span>Go to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </OnboardingLayout>
    )
  }

  // Default: Stage 1 (Student & Parent Details)
  return <StudentDetailsPage />
}
