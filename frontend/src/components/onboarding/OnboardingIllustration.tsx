import { useTheme } from '@/components/theme/ThemeProvider'
import { Sparkles, ShieldCheck } from 'lucide-react'

export function OnboardingIllustration() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // Using the genuine vector SVGs with customized light and dark theme palettes
  const illustrationSrc = isDark
    ? '/onboarding-illustration-dark.svg'
    : '/onboarding-illustration-light.svg'

  return (
    <div className="relative h-full w-full flex flex-col justify-between p-8 lg:p-10 xl:p-12 overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      {/* Top Header Card / Message */}
      <div className="relative z-10 space-y-2.5 max-w-md text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Stage 1 • Foundations</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
          Building your personalized education roadmap.
        </h2>
        <p className="text-xs sm:text-sm text-muted leading-relaxed font-normal">
          Accurate student and family details ensure relevant curriculum options, subject prerequisites, and tailored pathway simulations.
        </p>
      </div>

      {/* Central Illustration Display (Preserves 100% Vector Detail, no raster, no cropping) */}
      <div className="relative z-10 flex-1 my-6 flex items-center justify-center min-h-[340px] max-h-[540px]">
        <div className="relative w-full h-full flex items-center justify-center p-2">
          <img
            key={illustrationSrc}
            src={illustrationSrc}
            alt="Forkora Student Academic Onboarding Illustration"
            className="w-full h-full max-h-[480px] xl:max-h-[520px] object-contain drop-shadow-md transition-all duration-300 hover:scale-[1.01]"
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
        <span>Forkora Pathway Engine</span>
      </div>
    </div>
  )
}
