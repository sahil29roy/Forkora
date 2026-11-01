import React from 'react'
import { OnboardingHeader } from './OnboardingHeader'
import { OnboardingIllustration } from './OnboardingIllustration'
import { StepKey } from './OnboardingProgress'

interface OnboardingLayoutProps {
  currentStep?: StepKey
  children: React.ReactNode
}

export function OnboardingLayout({
  currentStep = 'details',
  children,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Header with Progress and Theme Selector */}
      <OnboardingHeader currentStep={currentStep} />

      {/* Main Two-Column Layout (58% Left Form / 42% Right Illustration on Desktop) */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
        {/* Left Column: Form Container */}
        <div className="w-full lg:col-span-7 flex flex-col justify-start items-center px-4 py-8 sm:px-8 md:px-10 lg:px-12 xl:px-16 z-10">
          <div className="w-full max-w-xl xl:max-w-2xl space-y-6 sm:space-y-8">
            {children}
          </div>
        </div>

        {/* Right Column: Vector Illustration Panel */}
        <div className="hidden lg:flex lg:col-span-5 relative border-l border-border/60 bg-gradient-to-br from-indigo-50/70 via-slate-50/40 to-teal-50/30 dark:from-[#0E0F17] dark:via-[#13141F] dark:to-[#0A0B12] dark:border-l dark:border-[#222230] overflow-hidden sticky top-[69px] h-[calc(100vh-69px)]">
          <OnboardingIllustration />
        </div>
      </main>
    </div>
  )
}
