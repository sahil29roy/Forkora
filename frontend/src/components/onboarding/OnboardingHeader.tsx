import { ForkoraLogo } from '@/components/brand/ForkoraLogo'
import { ThemeSelector } from '@/components/auth/ThemeSelector'
import { OnboardingProgress, StepKey } from './OnboardingProgress'
import { useAuth } from '@/context/AuthContext'
import { User } from 'lucide-react'

interface OnboardingHeaderProps {
  currentStep?: StepKey
}

export function OnboardingHeader({ currentStep = 'details' }: OnboardingHeaderProps) {
  const { user } = useAuth()

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

      {/* Right: Theme Selector + User Profile / Avatar Element */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeSelector />

        {/* User Profile / Avatar Element */}
        <div
          title={user?.display_name || user?.email || 'User Account'}
          aria-label="User Account"
          className="h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none cursor-default transition-transform hover:scale-105"
        >
          {user?.display_name ? (
            user.display_name.charAt(0).toUpperCase()
          ) : (
            <User className="h-4 w-4" />
          )}
        </div>
      </div>
    </header>
  )
}
