import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Trophy,
  ArrowRight,
  RotateCw,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Brain,
  ShieldCheck,
  Compass,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { assessmentService } from '@/services/assessment.service'
import { ASSESSMENT_MODULE_CONFIGS } from '@/config/assessmentConfig'
import type { AssessmentResultDTO, AssessmentModuleId } from '@/types/assessment.types'

export function AssessmentResultsPage() {
  const { moduleId = 'academic', attemptId: rawAttemptId } = useParams<{
    moduleId: string
    attemptId: string
  }>()
  const attemptId = parseInt(rawAttemptId || '0', 10)
  const navigate = useNavigate()
  const { token } = useAuth()

  const validModuleId = moduleId.toLowerCase() as AssessmentModuleId
  const config = ASSESSMENT_MODULE_CONFIGS[validModuleId] || ASSESSMENT_MODULE_CONFIGS.academic

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [result, setResult] = useState<AssessmentResultDTO | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadResult = useCallback(async () => {
    if (!attemptId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await assessmentService.getResults(attemptId, token)
      setResult(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load assessment results.')
    } finally {
      setIsLoading(false)
    }
  }, [attemptId, token])

  useEffect(() => {
    loadResult()
  }, [loadResult])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <RotateCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          Loading your {config.title} results...
        </p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <AppLayout
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Assessments', href: '/assessments' },
          { label: 'Results' },
        ]}
      >
        <div className="max-w-md mx-auto text-center p-8 rounded-2xl border border-border bg-card space-y-4 mt-8">
          <AlertCircle className="h-10 w-10 text-warning mx-auto" />
          <h2 className="text-lg font-bold text-foreground">Results Unavailable</h2>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            {error || 'Results for this assessment attempt are not available yet.'}
          </p>
          <Button
            type="button"
            onClick={() => navigate('/assessments')}
            className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            Back to Assessments
          </Button>
        </div>
      </AppLayout>
    )
  }

  const summary = result.summary || {}
  const scorePercentage = Math.round(Number(result.score_percentage || 0))

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Assessments', href: '/assessments' },
        { label: config.title, href: `/assessments` },
        { label: 'Results' },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in text-left pb-16">
        {/* Top Celebration & Score Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Assessment Completed</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {config.title} Summary
              </h1>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Here is your objective performance breakdown and insights calculated from your submitted responses.
              </p>
            </div>

            {/* Score Ring / Badge */}
            {validModuleId !== 'behavioural' && (
              <div className="flex sm:flex-col items-center justify-between sm:justify-center p-4 rounded-2xl bg-primary/8 border border-primary/20 shrink-0 min-w-[140px] text-center">
                <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
                  {scorePercentage}%
                </span>
                <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">
                  Overall Score
                </span>
                {result.correct_answers !== undefined && (
                  <span className="text-xs text-foreground font-semibold mt-1">
                    {result.correct_answers} of {result.total_questions} Correct
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Module Specific Visual Breakdown */}
        {validModuleId === 'academic' && (
          <div className="space-y-6">
            {/* Subject-Wise Performance */}
            {summary.subjectPerformance && Object.keys(summary.subjectPerformance).length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">
                    Subject-Wise Accuracy
                  </h3>
                </div>

                <div className="space-y-3.5 pt-1">
                  {Object.entries(summary.subjectPerformance).map(([sub, data]: [string, any]) => (
                    <div key={sub} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">{sub}</span>
                        <span className="text-muted-foreground">
                          {data.correct} / {data.total} ({data.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Performance Breakdown */}
            {summary.topicPerformance && Object.keys(summary.topicPerformance).length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">
                    Topic Breakdown
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {Object.entries(summary.topicPerformance).map(([top, data]: [string, any]) => (
                    <div key={top} className="p-3 rounded-xl border border-border/60 bg-muted/10 text-xs flex justify-between items-center">
                      <span className="font-medium text-foreground truncate pr-2">{top}</span>
                      <span className="font-bold text-primary shrink-0">{data.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {validModuleId === 'aptitude' && (
          <div className="space-y-6">
            {/* Aptitude Topic Performance */}
            {summary.topicPerformance && Object.keys(summary.topicPerformance).length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">
                    Reasoning Domain Performance
                  </h3>
                </div>

                <div className="space-y-3.5 pt-1">
                  {Object.entries(summary.topicPerformance).map(([topic, data]: [string, any]) => (
                    <div key={topic} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">{topic}</span>
                        <span className="text-muted-foreground">
                          {data.correct} / {data.total} ({data.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {validModuleId === 'behavioural' && (
          <div className="space-y-6">
            {/* 6 Dimension Likert Averages (1.0 to 5.0) */}
            {summary.dimensionAverages && (
              <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-bold text-foreground">
                      Behavioural Dimension Tendencies
                    </h3>
                  </div>
                  <span className="text-xs text-muted">Scale 1.0 – 5.0</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  These scores reflect self-reported work and learning habits across 6 core competency dimensions, rather than fixed personality labels.
                </p>

                <div className="space-y-4 pt-2">
                  {Object.entries(summary.dimensionAverages).map(([dim, avg]: [string, any]) => {
                    const numAvg = Number(avg)
                    const percent = Math.round((numAvg / 5) * 100)

                    return (
                      <div key={dim} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-foreground">{dim}</span>
                          <span className="font-bold text-primary">{numAvg.toFixed(1)} / 5.0</span>
                        </div>
                        <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {validModuleId === 'situational' && (
          <div className="space-y-6">
            {/* Situational Behavioural Signals */}
            {summary.behaviouralSignals && Object.keys(summary.behaviouralSignals).length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-bold text-foreground">
                    Decision-Making Behavioural Signals
                  </h3>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Extracted from scenario choices reflecting situational ethics, collaboration, initiative, and problem-solving velocity.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {Object.entries(summary.behaviouralSignals).map(([signal, score]: [string, any]) => (
                    <div
                      key={signal}
                      className="p-3.5 rounded-xl border border-border/70 bg-card flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-foreground capitalize">
                        {signal.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-extrabold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                        {Number(score).toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/70">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/assessments')}
            className="w-full sm:w-auto h-11 px-6 rounded-xl border-border text-xs font-semibold"
          >
            Back to Assessments Overview
          </Button>

          <Button
            type="button"
            onClick={() => navigate('/assessments')}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs gap-2 shadow-xs cursor-pointer"
          >
            <span>Continue Next Assessment</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
