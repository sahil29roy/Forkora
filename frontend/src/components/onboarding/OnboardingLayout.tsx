import React from 'react'
import { OnboardingHeader } from './OnboardingHeader'
import { OnboardingIllustration } from './OnboardingIllustration'
import { StepKey } from './OnboardingProgress'
import { cn } from '@/lib/utils'

interface OnboardingLayoutProps {
  currentStep?: StepKey
  children: React.ReactNode
  rightPanel?: React.ReactNode
}

export function OnboardingLayout({
  currentStep = 'details',
  children,
  rightPanel,
}: OnboardingLayoutProps) {
  const isAcademic = currentStep === 'academic'

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Header with Progress, Theme Selector, and User Avatar */}
      <OnboardingHeader currentStep={currentStep} />

      {/* Main Two-Column Layout (Desktop: 66.7% Left / 33.3% Right for Academic Info; 58% Left / 42% Right for Details) */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
        {/* Left Column: Form Container */}
        <div
          className={cn(
            'w-full flex flex-col justify-start items-center px-4 py-8 sm:px-8 md:px-10 lg:px-12 xl:px-16 z-10',
            isAcademic ? 'lg:col-span-8' : 'lg:col-span-7'
          )}
        >
          <div
            className={cn(
              'w-full space-y-6 sm:space-y-8',
              isAcademic ? 'max-w-2xl xl:max-w-3xl' : 'max-w-xl xl:max-w-2xl'
            )}
          >
            {children}
          </div>
        </div>

        {/* Right Column: Illustration & Guidance Panel */}
        <div
          className={cn(
            'hidden lg:flex relative overflow-hidden sticky top-[69px] h-[calc(100vh-69px)] border-l',
            isAcademic
              ? 'lg:col-span-4 border-border/60 bg-gradient-to-br from-[#F5F2FF] via-[#EDE8FF]/40 to-[#F8FAFC] dark:from-[#0E0F17] dark:via-[#13141F] dark:to-[#0A0B12] dark:border-[#222230]'
              : 'lg:col-span-5 border-border/60 bg-gradient-to-br from-indigo-50/70 via-slate-50/40 to-teal-50/30 dark:from-[#0E0F17] dark:via-[#13141F] dark:to-[#0A0B12] dark:border-[#222230]'
          )}
        >
          {rightPanel || <OnboardingIllustration />}
        </div>
      </main>
    </div>
  )
}
