import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Clock,
  HelpCircle,
  ArrowRight,
  RotateCw,
  BookOpen,
  GraduationCap,
  Layers,
  Sparkles,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { assessmentService } from '@/services/assessment.service'
import { onboardingService } from '@/services/onboarding.service'
import { ASSESSMENT_MODULE_CONFIGS } from '@/config/assessmentConfig'
import type { AssessmentModuleId } from '@/types/assessment.types'

export function AssessmentInstructionsPage() {
  const { moduleId = 'academic' } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()

  const validModuleId = moduleId.toLowerCase() as AssessmentModuleId
  const config = ASSESSMENT_MODULE_CONFIGS[validModuleId] || ASSESSMENT_MODULE_CONFIGS.academic
  const Icon = config.icon

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isStarting, setIsStarting] = useState<boolean>(false)
  const [moduleDetails, setModuleDetails] = useState<any>(null)
  const [studentProfile, setStudentProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [details, profile] = await Promise.all([
          assessmentService.getModuleDetails(validModuleId, token),
          validModuleId === 'academic' ? onboardingService.getExistingProfile(token) : Promise.resolve(null),
        ])

        if (isMounted) {
          setModuleDetails(details)
          setStudentProfile(profile)
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load module instructions.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [validModuleId, token])

  const handleStart = async () => {
    setIsStarting(true)
    setError(null)
    try {
      const res = await assessmentService.startOrResumeAssessment(validModuleId, token)
      const attemptId = res.attempt?.id
      if (!attemptId) {
        throw new Error('Failed to obtain a valid assessment attempt ID.')
      }
      navigate(`/assessments/${validModuleId}/${attemptId}`)
    } catch (err: any) {
      setError(err?.message || 'Could not start assessment. Please try again.')
      setIsStarting(false)
    }
  }

  const activeAttempt = moduleDetails?.active_attempt
  const hasActiveAttempt = Boolean(activeAttempt && activeAttempt.status === 'IN_PROGRESS')

  const getModuleInstructions = () => {
    switch (validModuleId) {
      case 'academic':
        return [
          "Questions are selected based on your class level and academic background.",
          'Read each question carefully and select the single best answer.',
          'Your progress is saved automatically with every answered question.',
          'You may navigate freely between questions before submitting.',
        ]
      case 'aptitude':
        return [
          'Questions evaluate logical, numerical, verbal, and pattern recognition skills.',
          'Work methodically through each puzzle or reasoning problem.',
          'Select the option that logically satisfies the given conditions.',
          'There is no penalty for changing an answer before final submission.',
        ]
      case 'behavioural':
        return [
          'Read each statement describing a habit, preference, or working style.',
          'Rate each statement honestly on a 5-point scale from Strongly Disagree to Strongly Agree.',
          'There are no right or wrong answers; this assessment explores your tendencies.',
          'Answer based on how you usually behave in study or project settings.',
        ]
      case 'situational':
        return [
          'Each scenario presents a real-world dilemma or career situation.',
          'Read the context thoroughly before reviewing the four available responses.',
          'Choose the action that best represents what you would genuinely do.',
          'Options explore multidimensional behavioural signals like collaboration, ethics, and leadership.',
        ]
      default:
        return ['Read each prompt carefully and select your response.']
    }
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Assessments', href: '/assessments' },
        { label: config.title, href: `/assessments` },
        { label: 'Instructions' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-fade-in text-left pb-10">
        {/* Module Header Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {config.title}
                </h1>
                <p className="text-xs sm:text-sm text-muted">
                  {config.description}
                </p>
              </div>
            </div>

            {hasActiveAttempt && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                Attempt In Progress
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground border-t border-border/60">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span>{config.questionCount} {validModuleId === 'behavioural' ? 'Statements' : validModuleId === 'situational' ? 'Scenarios' : 'Questions'}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>~{config.estimatedDuration} minutes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Auto-saved progress</span>
            </span>
          </div>

          {hasActiveAttempt && (
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground flex items-center justify-between">
              <span>
                You have an unfinished attempt with <strong>{activeAttempt.answered_count}</strong> of <strong>{activeAttempt.total_questions}</strong> answered.
              </span>
              <span className="text-primary font-semibold">Resumable</span>
            </div>
          )}
        </div>

        {/* Academic Profile Summary (for Academic Module) */}
        {validModuleId === 'academic' && studentProfile && (
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Your Academic Context</span>
            </div>
            <p className="text-xs text-muted">
              Your questions are matched to your educational stage and stream.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-muted/15 border border-border/50 text-xs">
                <span className="text-[11px] text-muted-foreground block">Class Level</span>
                <span className="font-semibold text-foreground">
                  Class {studentProfile.studentProfile?.current_class || '10'}
                </span>
              </div>

              {studentProfile.academicRecord?.stream && (
                <div className="p-2.5 rounded-xl bg-muted/15 border border-border/50 text-xs">
                  <span className="text-[11px] text-muted-foreground block">Stream</span>
                  <span className="font-semibold text-foreground">
                    {studentProfile.academicRecord.stream}
                  </span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-muted/15 border border-border/50 text-xs col-span-2 sm:col-span-1">
                <span className="text-[11px] text-muted-foreground block">Education Board</span>
                <span className="font-semibold text-foreground">
                  {studentProfile.academicRecord?.education_board || 'CBSE'}
                </span>
              </div>
            </div>

            {studentProfile.academicRecord?.subjects?.length > 0 && (
              <div className="pt-2 text-xs">
                <span className="text-[11px] text-muted-foreground block mb-1">Enrolled Subjects:</span>
                <div className="flex flex-wrap gap-1.5">
                  {studentProfile.academicRecord.subjects.map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[11px]"
                    >
                      {s.subject_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions Section */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-base font-bold text-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Before You Begin</span>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {getModuleInstructions().map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>

          <div className="p-3.5 rounded-xl border border-border/60 bg-muted/15 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <Layers className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              You do not need to finish all 4 modules today. Each module is independently saved and scored. You may resume any time from the Overview page.
            </span>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/assessments')}
            className="w-full sm:w-auto h-11 px-6 rounded-xl border-border text-xs font-semibold"
          >
            Back to Overview
          </Button>

          <Button
            type="button"
            disabled={isLoading || isStarting}
            onClick={handleStart}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs gap-2 shadow-xs cursor-pointer"
          >
            {isStarting ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Preparing Session...</span>
              </>
            ) : hasActiveAttempt ? (
              <>
                <span>Resume Assessment</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Begin Assessment</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
