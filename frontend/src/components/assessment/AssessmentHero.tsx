import { useState } from 'react'
import { Sparkles, ArrowRight, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme/ThemeProvider'
import { HowItWorksDialog } from './HowItWorksDialog'

interface AssessmentHeroProps {
  onStartClick?: () => void
}

export function AssessmentHero({ onStartClick }: AssessmentHeroProps) {
  const { resolvedTheme } = useTheme()
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Use the verified boy-with-laptop SVGs matching active theme
  const isDark = resolvedTheme === 'dark'
  const illustrationSrc = isDark
    ? '/forkora-class10-boy-dark.svg'
    : '/forkora-class10-boy-light.svg'

  const handleStart = () => {
    if (onStartClick) {
      onStartClick()
    } else {
      // Smoothly scroll down to the assessment modules section
      const el = document.getElementById('assessment-modules-section')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 lg:p-9 shadow-xs text-left">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Text & CTA Area (approx 65%) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Personalized Pathway Discovery</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Discover More About Yourself
            </h2>

            <p className="text-xs sm:text-sm lg:text-base text-muted max-w-xl leading-relaxed">
              Explore your interests, understand your strengths, and discover the factors that influence your career preferences. Complete assessments at your own pace to build a clearer picture of yourself.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleStart}
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm shadow-xs shadow-primary/25 gap-2 cursor-pointer transition-all duration-150"
              >
                <span>Start Assessment</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowHowItWorks(true)}
                className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl border-border hover:bg-muted/40 font-semibold text-xs sm:text-sm gap-2 cursor-pointer transition-colors"
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <span>How It Works</span>
              </Button>
            </div>
          </div>

          {/* Right Illustration Area (approx 35%) */}
          <div className="lg:col-span-5 xl:col-span-4 flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none max-h-[220px] sm:max-h-[260px] flex items-center justify-center">
              <img
                key={illustrationSrc}
                src={illustrationSrc}
                alt="Student exploring assessment pathways"
                className="w-full h-auto max-h-[240px] object-contain drop-shadow-md select-none transition-transform duration-300 hover:scale-[1.02]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Dialog */}
      <HowItWorksDialog
        open={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </>
  )
}
