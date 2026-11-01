import { useTheme } from '@/components/theme/ThemeProvider'
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react'

export function JourneyInfoPanel() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // Using the dedicated light and dark SVG illustrations supplied for Class 10th
  const illustrationSrc = isDark
    ? '/forkora-class10-boy-dark.svg'
    : '/forkora-class10-boy-light.svg'

  const journeyHighlights = [
    'Explore suitable streams and career paths.',
    'Discover top courses (Engineering, CS, AI/ML, Business, and more).',
    'Check eligibility, entrance exams, and subject requirements.',
    'Compare multiple career options and future outcomes.',
  ]

  return (
    <div className="relative h-full w-full flex flex-col justify-between p-6 sm:p-8 lg:p-9 xl:p-10 overflow-y-auto select-none">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Top Header Card / Message */}
      <div className="relative z-10 space-y-3 max-w-md text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Stage 2 • Career Pathways</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
          Your Journey After School
        </h2>

        <p className="text-xs sm:text-sm text-muted leading-relaxed font-normal">
          Based on your academic performance and interests, Forkora will help you:
        </p>

        {/* Feature List */}
        <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-foreground/90 font-medium">
          {journeyHighlights.map((highlight, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <span className="leading-snug">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Central Illustration Display (Preserves SVG aspect ratio without stretching, cropping, or CSS filters) */}
      <div className="relative z-10 flex-1 my-4 py-2 flex items-center justify-center min-h-[260px] max-h-[460px]">
        <div className="relative w-full h-full flex items-center justify-center p-2">
          <img
            key={illustrationSrc}
            src={illustrationSrc}
            alt="Forkora Class 10th Student Journey Illustration"
            className="w-full h-full max-h-[380px] xl:max-h-[420px] object-contain drop-shadow-md transition-all duration-300 hover:scale-[1.01]"
            loading="eager"
          />
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Confidential student record</span>
        </div>
        <span className="font-medium text-[11px]">Forkora Pathway Engine</span>
      </div>
    </div>
  )
}
