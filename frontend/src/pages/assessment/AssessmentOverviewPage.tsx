import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { AssessmentHero } from '@/components/assessment/AssessmentHero'
import { AssessmentModuleCard } from '@/components/assessment/AssessmentModuleCard'
import { AssessmentOverallProgress } from '@/components/assessment/AssessmentOverallProgress'
import { BeforeYouStartCard } from '@/components/assessment/BeforeYouStartCard'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { assessmentService } from '@/services/assessment.service'
import type { ModuleProgressDTO } from '@/types/assessment.types'

export function AssessmentOverviewPage() {
  const { token } = useAuth()
  const [modules, setModules] = useState<ModuleProgressDTO[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModules = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await assessmentService.getModules(token)
      setModules(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load assessment modules. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Assessments' },
      ]}
    >
      <div className="space-y-6 sm:space-y-8 animate-fade-in text-left">
        {/* Page Heading & Subtitle matching specifications */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Your Assessments
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted max-w-2xl leading-relaxed">
            Explore your academic strengths, aptitude, behavioural tendencies and decision-making approach.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/25 flex items-center justify-between text-xs sm:text-sm text-destructive">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchModules}
              className="h-8 gap-1.5 text-xs border-destructive/30 hover:bg-destructive/10 text-destructive"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Two-Column Responsive Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (Hero & 2x2 Modules Grid) */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            <AssessmentHero />

            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Assessment Modules
                </h2>
                <p className="text-xs sm:text-sm text-muted">
                  Each module evaluates a distinct facet of your abilities. You can complete them individually at your own pace.
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border/70 bg-card p-6 space-y-4 animate-pulse h-60 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="h-10 w-10 bg-muted/20 rounded-xl" />
                        <div className="h-4 w-2/3 bg-muted/20 rounded-md" />
                        <div className="h-3 w-5/6 bg-muted/15 rounded-md" />
                      </div>
                      <div className="h-8 bg-muted/20 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {modules.map((mod) => (
                    <AssessmentModuleCard
                      key={mod.module_id}
                      module={mod}
                      onRetry={fetchModules}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Bottom Overall Progress Component */}
            {!isLoading && modules.length > 0 && (
              <AssessmentOverallProgress modules={modules} />
            )}
          </div>

          {/* Right Column (Informational & Guidance) */}
          <div className="lg:col-span-4 space-y-5 sm:space-y-6">
            <BeforeYouStartCard />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
