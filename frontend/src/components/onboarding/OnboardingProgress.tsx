import { Check, User, BookOpen, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StepKey = 'details' | 'academic' | 'review'

interface OnboardingProgressProps {
  currentStep?: StepKey
  className?: string
}

export function OnboardingProgress({
  currentStep = 'details',
  className,
}: OnboardingProgressProps) {
  const steps = [
    {
      id: 'details',
      label: 'Your Details',
      number: 1,
      icon: User,
    },
    {
      id: 'academic',
      label: 'Academic Info',
      number: 2,
      icon: BookOpen,
    },
    {
      id: 'review',
      label: 'Review',
      number: 3,
      icon: CheckCircle2,
    },
  ]

  const getStepStatus = (stepId: string) => {
    if (stepId === currentStep) return 'active'
    if (currentStep === 'academic' && stepId === 'details') return 'completed'
    if (currentStep === 'review' && (stepId === 'details' || stepId === 'academic')) return 'completed'
    return 'upcoming'
  }

  return (
    <nav
      aria-label="Onboarding Progress"
      className={cn('flex items-center gap-1.5 sm:gap-3 select-none', className)}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(step.id)
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Item */}
            <div
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
                status === 'active' &&
                  'bg-primary/10 text-primary border border-primary/25 shadow-xs shadow-primary/10',
                status === 'completed' &&
                  'bg-success/10 text-success border border-success/20',
                status === 'upcoming' &&
                  'text-muted-foreground/80 hover:text-muted-foreground border border-transparent'
              )}
              aria-current={status === 'active' ? 'step' : undefined}
            >
              {/* Step Badge */}
              <span
                className={cn(
                  'flex h-5 w-5 sm:h-5 sm:w-5 items-center justify-center rounded-full text-[11px] font-bold shrink-0 transition-colors',
                  status === 'active' && 'bg-primary text-primary-foreground shadow-xs',
                  status === 'completed' && 'bg-success text-white',
                  status === 'upcoming' &&
                    'bg-muted/20 text-muted-foreground border border-border/80'
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  step.number
                )}
              </span>

              {/* Step Label */}
              <span
                className={cn(
                  'text-[11px] sm:text-xs tracking-tight whitespace-nowrap',
                  status === 'active' && 'font-bold text-foreground',
                  status === 'completed' && 'font-medium text-foreground/90',
                  status === 'upcoming' && 'font-normal text-muted-foreground hidden md:inline'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting Divider between steps */}
            {!isLast && (
              <div
                className={cn(
                  'w-4 sm:w-8 h-[2px] mx-1 sm:mx-1.5 rounded-full transition-colors',
                  status === 'completed' ? 'bg-success/40' : 'bg-border/80'
                )}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
