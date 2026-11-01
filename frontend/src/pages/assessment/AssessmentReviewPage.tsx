import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  RotateCw,
  Send,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { assessmentService } from '@/services/assessment.service'
import { ASSESSMENT_MODULE_CONFIGS } from '@/config/assessmentConfig'
import type { ClientSafeQuestion, AssessmentModuleId } from '@/types/assessment.types'

export function AssessmentReviewPage() {
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
  const [questions, setQuestions] = useState<ClientSafeQuestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const loadAttemptData = useCallback(async () => {
    if (!attemptId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await assessmentService.getAssignedQuestions(attemptId, token)
      setQuestions(data.questions || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load assessment review data.')
    } finally {
      setIsLoading(false)
    }
  }, [attemptId, token])

  useEffect(() => {
    loadAttemptData()
  }, [loadAttemptData])

  const totalQuestions = questions.length
  const answeredCount = questions.filter(
    (q) => q.is_answered || q.selected_option_id || q.selected_option_text || q.response_value
  ).length
  const unansweredCount = totalQuestions - answeredCount
  const progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  const handleReturnToQuestion = (index: number) => {
    navigate(`/assessments/${validModuleId}/${attemptId}?q=${index + 1}`)
  }

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await assessmentService.submitAssessment(attemptId, token)
      navigate(`/assessments/${validModuleId}/${attemptId}/results`)
    } catch (err: any) {
      setError(err?.message || 'Submission failed. Please try again.')
      setIsSubmitting(false)
      setShowConfirmModal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <RotateCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          Preparing review summary...
        </p>
      </div>
    )
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Assessments', href: '/assessments' },
        { label: config.title, href: `/assessments` },
        { label: 'Review & Submit' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-fade-in text-left pb-12">
        {/* Header */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Review Your Assessment
          </h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Check your responses before submitting. You can return to any unanswered question.
          </p>
        </div>

        {/* Progress Summary Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                Completion Status
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-foreground">
                  {progressPercentage}%
                </span>
                <span className="text-xs text-muted">
                  ({answeredCount} of {totalQuestions} answered)
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-success/10 text-success text-xs font-semibold flex items-center gap-1.5 border border-success/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{answeredCount} Answered</span>
              </span>
              {unansweredCount > 0 && (
                <span className="px-3 py-1.5 rounded-xl bg-warning/10 text-warning text-xs font-semibold flex items-center gap-1.5 border border-warning/20">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{unansweredCount} Unanswered</span>
                </span>
              )}
            </div>
          </div>

          <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Questions Grid Navigator */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Questions Overview
            </h3>
            <span className="text-xs text-muted">Click any item to view or edit</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {questions.map((q, idx) => {
              const isAnswered =
                q.is_answered || q.selected_option_id || q.selected_option_text || q.response_value

              return (
                <button
                  key={q.assigned_question_id}
                  type="button"
                  onClick={() => handleReturnToQuestion(idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isAnswered
                      ? 'border-border/80 bg-card hover:border-primary/40 hover:bg-primary/5'
                      : 'border-warning/30 bg-warning/5 hover:border-warning/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="h-6 w-6 rounded-lg bg-muted/20 flex items-center justify-center font-bold text-xs shrink-0 text-foreground">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-foreground font-medium truncate">
                      {q.question_text}
                    </span>
                  </div>

                  {isAnswered ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <span className="text-[11px] font-semibold text-warning shrink-0">
                      Pending
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Unanswered Warning Banner */}
        {unansweredCount > 0 && (
          <div className="p-4 rounded-xl bg-warning/10 border border-warning/25 text-xs text-warning flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              You have <strong>{unansweredCount}</strong> unanswered {unansweredCount === 1 ? 'question' : 'questions'}. You may still submit, but answering all questions yields the most accurate insights.
            </span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/assessments/${validModuleId}/${attemptId}`)}
            className="w-full sm:w-auto h-11 px-6 rounded-xl border-border text-xs font-semibold gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Questions</span>
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => setShowConfirmModal(true)}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs gap-2 shadow-xs cursor-pointer"
          >
            <span>Submit Assessment</span>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog matching specification */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Submit Assessment?
                </h3>
                <p className="text-xs text-muted">Confirm final submission</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Are you sure you want to submit your assessment? You may not be able to change your responses afterwards.
            </p>

            {unansweredCount > 0 && (
              <p className="text-xs text-warning font-medium">
                Note: You currently have {unansweredCount} unanswered questions.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="h-9 px-4 rounded-xl border-border text-xs"
              >
                Go Back
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="h-9 px-5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold gap-1.5 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Confirm Submission</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
