import React from 'react'
import { AuthHeader } from './AuthHeader'
import { AuthIllustration } from './AuthIllustration'

interface AuthLayoutProps {
  type: 'login' | 'signup'
  children: React.ReactNode
}

export function AuthLayout({ type, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Navigation Header */}
      <AuthHeader type={type} />

      {/* Main Authentication Grid */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Form Panel (55% / 7 cols on large screens) */}
        <div className="w-full lg:col-span-7 flex flex-col justify-center items-center px-4 py-8 sm:px-8 md:px-12 lg:px-14 xl:px-16 z-10">
          <div className="w-full max-w-[440px] space-y-6">
            {children}
          </div>
        </div>

        {/* Right Column: Illustration & Brand Panel (45% / 5 cols on large screens) */}
        <div className="hidden lg:flex lg:col-span-5 relative border-l border-border/60 bg-gradient-to-br from-indigo-50/70 via-slate-50/40 to-teal-50/30 dark:from-[#0E0F17] dark:via-[#13141F] dark:to-[#0A0B12] dark:border-l dark:border-[#222230] overflow-hidden">
          <AuthIllustration type={type} />
        </div>
      </div>
    </div>
  )
}
