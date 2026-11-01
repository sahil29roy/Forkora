import { ForkoraLogo } from '@/components/brand/ForkoraLogo'
import { ThemeSelector } from '@/components/auth/ThemeSelector'
import { OnboardingProgress, StepKey } from './OnboardingProgress'

interface OnboardingHeaderProps {
  currentStep?: StepKey
}

export function OnboardingHeader({ currentStep = 'details' }: OnboardingHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-4 py-3.5 sm:px-8 sm:py-4 lg:px-12 lg:py-5 border-b border-border/60 bg-background/90 backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Left: Forkora Brand Logo */}
      <div className="flex items-center">
        <ForkoraLogo iconSize="sm" textSize="sm" />
      </div>

      {/* Center: 3-Stage Guided Onboarding Progress */}
      <div className="flex items-center justify-center">
        <OnboardingProgress currentStep={currentStep} />
      </div>

      {/* Right: Theme Selector */}
      <div className="flex items-center gap-2">
        <ThemeSelector />
      </div>
    </header>
  )
}
