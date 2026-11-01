import { X, Sparkles, Compass, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HowItWorksDialogProps {
  open: boolean
  onClose: () => void
}

export function HowItWorksDialog({ open, onClose }: HowItWorksDialogProps) {
  if (!open) return null

  const steps = [
    {
      stepNumber: 1,
      title: 'Explore the Assessment Modules',
      description:
        'Familiarize yourself with the four distinct dimensions: Interest Discovery, Aptitude Assessment, Learning Preferences, and Work Style & Motivation.',
      icon: Compass,
    },
    {
      stepNumber: 2,
      title: 'Complete at Your Own Pace',
      description:
        'Answer questions thoughtfully and honestly based on your genuine preferences. Take them one by one without time pressure or stress.',
      icon: CheckCircle2,
    },
    {
      stepNumber: 3,
      title: 'Unlock Personalized Career Insights',
      description:
        'Once completed, Forkora synthesizes your profile to generate dynamic career graphs, stream eligibility maps, and personalized academic roadmaps.',
      icon: Sparkles,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-it-works-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-xl space-y-6 text-left overflow-hidden"
      >
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20">
              <Sparkles className="h-3 w-3" />
              <span>Assessment Process</span>
            </div>
            <h3 id="how-it-works-title" className="text-xl font-bold text-foreground tracking-tight">
              How Assessments Work
            </h3>
            <p className="text-xs sm:text-sm text-muted">
              A structured 3-stage journey to guide your academic and career choices.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3 Stages Timeline */}
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isLast = idx === steps.length - 1

            return (
              <div key={step.stepNumber} className="relative flex items-start gap-3.5">
                {/* Node & Line */}
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs shrink-0 border border-primary/25">
                    {step.stepNumber}
                  </div>
                  {!isLast && (
                    <div className="w-[2px] h-10 my-1 bg-border/70 rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1 pt-0.5 flex-1">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span>{step.title}</span>
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto h-9 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <span>Got It, Let's Begin</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
