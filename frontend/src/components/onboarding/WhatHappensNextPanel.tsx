import { useTheme } from '@/components/theme/ThemeProvider'
import { Sparkles, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WhatHappensNextPanel() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const illustrationSrc = isDark
    ? '/forkora-class10-boy-dark.svg'
    : '/forkora-class10-boy-light.svg'

  const timelineSteps = [
    {
      stepNumber: 1,
      title: 'Onboarding Complete',
      description: 'Your academic profile will be saved.',
      status: 'current' as const, // Ready for confirmation
    },
    {
      stepNumber: 2,
      title: 'Take an Assessment',
      description:
        'Answer a short, guided assessment to understand your interests, aptitudes and preferred work style.',
      status: 'upcoming' as const,
    },
    {
      stepNumber: 3,
      title: 'Explore Your Career Paths',
      description:
        'Get personalized career pathways, course options, eligibility and future opportunities.',
      status: 'future' as const,
    },
  ]

  return (
    <div className="relative h-full w-full flex flex-col justify-between p-6 sm:p-8 lg:p-9 xl:p-10 overflow-y-auto select-none">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Top Header Card */}
      <div className="relative z-10 space-y-3 max-w-md text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Stage 3 • Confirmation</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
          What Happens Next?
        </h2>

        <p className="text-xs sm:text-sm text-muted leading-relaxed font-normal">
          Here is what will unfold once you confirm your academic background:
        </p>

        {/* 3-Step Vertical Timeline */}
        <div className="pt-2 space-y-4">
          {timelineSteps.map((step, index) => {
            const isLast = index === timelineSteps.length - 1
            const isCurrent = step.status === 'current'

            return (
              <div key={step.stepNumber} className="relative flex items-start gap-3.5 group">
                {/* Timeline Node & Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all shadow-xs',
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted/80 text-muted-foreground border border-border/80'
                    )}
                  >
                    {isCurrent ? (
                      <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                    ) : (
                      step.stepNumber
                    )}
                  </div>

                  {!isLast && (
                    <div
                      className={cn(
                        'w-[2px] h-10 my-1 rounded-full transition-colors',
                        isCurrent ? 'bg-primary/40' : 'bg-border/60'
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="space-y-0.5 text-left pt-0.5 flex-1">
                  <h4
                    className={cn(
                      'text-xs sm:text-sm font-bold tracking-tight',
                      isCurrent ? 'text-primary' : 'text-foreground/90'
                    )}
                  >
                    Step {step.stepNumber} — {step.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Central Illustration Display (Preserves exact SVG aspect ratio without stretching, cropping, or CSS filters) */}
      <div className="relative z-10 flex-1 my-4 py-2 flex items-center justify-center min-h-[240px] max-h-[380px]">
        <div className="relative w-full h-full flex items-center justify-center p-2">
          <img
            key={illustrationSrc}
            src={illustrationSrc}
            alt="Forkora Student Journey Illustration"
            className="w-full h-full max-h-[320px] xl:max-h-[360px] object-contain drop-shadow-md transition-all duration-300 hover:scale-[1.01]"
            loading="eager"
          />
        </div>
      </div>

      {/* Subtle Information Note */}
      <div className="relative z-10 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted text-left">
        <Info className="h-4 w-4 text-primary shrink-0" />
        <span className="leading-snug">
          You can always update your information later from your profile.
        </span>
      </div>
    </div>
  )
}
