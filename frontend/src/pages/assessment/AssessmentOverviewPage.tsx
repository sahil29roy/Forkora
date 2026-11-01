import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { AssessmentHero } from '@/components/assessment/AssessmentHero'
import { AssessmentModulesGrid } from '@/components/assessment/AssessmentModulesGrid'
import { AssessmentStatusCard } from '@/components/assessment/AssessmentStatusCard'
import { BeforeYouStartCard } from '@/components/assessment/BeforeYouStartCard'
import type { AssessmentModule } from '@/types/assessment.types'

export function AssessmentOverviewPage() {
  const [selectedModule, setSelectedModule] = useState<AssessmentModule | null>(null)

  const handleSelectModule = (mod: AssessmentModule) => {
    setSelectedModule(mod)
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Assessments' },
      ]}
    >
      <div className="space-y-6 sm:space-y-8 animate-fade-in text-left">
        {/* Page Top Heading & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Career Assessment Overview
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted max-w-2xl leading-relaxed">
            Understand your interests, strengths, learning preferences, and work preferences through a set of guided assessments.
          </p>
        </div>

        {/* Two-Column Responsive Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (Hero & Modules Grid: ~68% on Desktop) */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* Hero Banner Section */}
            <AssessmentHero />

            {/* Assessment Modules Grid */}
            <AssessmentModulesGrid onSelectModule={handleSelectModule} />
          </div>

          {/* Right Column (Status & Before You Start: ~32% on Desktop) */}
          <div className="lg:col-span-4 space-y-5 sm:space-y-6">
            {/* Assessment Status Panel */}
            <AssessmentStatusCard />

            {/* Before You Start Informational Card */}
            <BeforeYouStartCard />
          </div>
        </div>
      </div>

      {/* Selected Module Detail / Notice Modal if user clicks Start Module */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in select-none">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedModule(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <selectedModule.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {selectedModule.title}
                </h3>
                <p className="text-xs text-muted">Module selected</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {selectedModule.description}
            </p>

            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-muted-foreground leading-relaxed">
              Assessment questions and response collection for this module will be connected once the backend assessment engine is configured.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
