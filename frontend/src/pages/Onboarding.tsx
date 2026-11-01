import { useSearchParams, useNavigate } from 'react-router-dom'
import { StudentDetailsPage } from './onboarding/StudentDetailsPage'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { BookOpen, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Onboarding() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const step = searchParams.get('step')
  const branch = searchParams.get('branch')
  const classLevel = searchParams.get('class')

  // When navigated to Stage 2: Academic Info branch
  if (step === 'academic') {
    const isClass10 = branch === 'class-10' || (classLevel && Number(classLevel) <= 10)

    return (
      <OnboardingLayout currentStep="academic">
        <div className="w-full space-y-6 sm:space-y-8 animate-fade-in text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Stage 2 • Academic Pathway</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              {isClass10 ? 'Class 10 Academic Information' : 'Class 12 Academic Information'}
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-xl">
              {isClass10
                ? 'Your personal and parent details have been recorded. You are routed to Branch A (Secondary School Curriculum & Electives).'
                : 'Your personal and parent details have been recorded. You are routed to Branch B (Higher Secondary Stream Selection & Subject Combinations).'}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">
                  {isClass10 ? 'Branch A: Class 10 Foundation' : 'Branch B: Class 11-12 Streams'}
                </h4>
                <p className="text-xs text-muted">
                  Academic details and marks collection will be configured in the next phase.
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

  // Default: First Screen (Student & Parent Details)
  return <StudentDetailsPage />
}
