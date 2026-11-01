import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertCircle, RefreshCw, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { assessmentService } from '@/services/assessment.service'
import { ASSESSMENT_MODULE_CONFIGS } from '@/config/assessmentConfig'
import { AssessmentSessionHeader } from '@/components/assessment/session/AssessmentSessionHeader'
import { AssessmentProgressBar } from '@/components/assessment/session/AssessmentProgressBar'
import { QuestionNavigator } from '@/components/assessment/session/QuestionNavigator'
import { MCQQuestionView } from '@/components/assessment/session/MCQQuestionView'
import { LikertQuestionView } from '@/components/assessment/session/LikertQuestionView'
import { SituationalQuestionView } from '@/components/assessment/session/SituationalQuestionView'
import { SessionBottomBar } from '@/components/assessment/session/SessionBottomBar'
import type { ClientSafeQuestion, AssessmentModuleId } from '@/types/assessment.types'

export function AssessmentSessionPage() {
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
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<ClientSafeQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Answers store: map assigned_question_id -> { option_id, option_text, response_value }
  const [responses, setResponses] = useState<
    Record<
      number,
      {
        selected_option_id?: number | string | null
        selected_option_text?: string | null
        response_value?: number | null
      }
    >
  >({})

  // Fetch assigned questions from backend
  const loadQuestions = useCallback(async () => {
    if (!attemptId) {
      setError('Invalid assessment attempt ID.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await assessmentService.getAssignedQuestions(attemptId, token)
      setQuestions(data.questions || [])

      // Seed initial responses from already answered questions
      const initialMap: Record<number, any> = {}
      data.questions.forEach((q) => {
        if (q.is_answered || q.selected_option_id || q.selected_option_text || q.response_value) {
          initialMap[q.assigned_question_id] = {
            selected_option_id: q.selected_option_id,
            selected_option_text: q.selected_option_text,
            response_value: q.response_value,
          }
        }
      })
      setResponses(initialMap)

      // Find first unanswered question or default to 0
      const firstUnansweredIndex = data.questions.findIndex((q) => !q.is_answered)
      if (firstUnansweredIndex > 0) {
        setCurrentIndex(firstUnansweredIndex)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load assigned questions.')
    } finally {
      setIsLoading(false)
    }
  }, [attemptId, token])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  // Answered indices calculation for navigator
  const answeredIndices = useMemo(() => {
    const set = new Set<number>()
    questions.forEach((q, idx) => {
      const resp = responses[q.assigned_question_id]
      if (resp && (resp.selected_option_id || resp.selected_option_text || resp.response_value)) {
        set.add(idx)
      } else if (q.is_answered) {
        set.add(idx)
      }
    })
    return set
  }, [questions, responses])

  // Save student response with auto-save & error handling
  const handleSaveResponse = async (payload: {
    selected_option_id?: number | string | null
    selected_option_text?: string | null
    response_value?: number | null
  }) => {
    const currentQ = questions[currentIndex]
    if (!currentQ || !attemptId) return

    // Optimistically update local state
    setResponses((prev) => ({
      ...prev,
      [currentQ.assigned_question_id]: {
        ...prev[currentQ.assigned_question_id],
        ...payload,
      },
    }))

    setSavingStatus('saving')
    try {
      await assessmentService.saveResponse(
        attemptId,
        {
          assigned_question_id: currentQ.assigned_question_id,
          selected_option_id: payload.selected_option_id ? Number(payload.selected_option_id) : undefined,
          selected_option_text: payload.selected_option_text || undefined,
          response_value: payload.response_value !== undefined ? payload.response_value : undefined,
        },
        token
      )
      setSavingStatus('saved')
    } catch (err: any) {
      setSavingStatus('error')
      console.error('Failed to save response:', err)
    }
  }

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleReview = () => {
    navigate(`/assessments/${validModuleId}/${attemptId}/review`)
  }

  const currentQuestion = questions[currentIndex]
  const currentResponse = currentQuestion ? responses[currentQuestion.assigned_question_id] : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <RotateCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          Loading {config.title} questions...
        </p>
      </div>
    )
  }

  if (error || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-destructive/30 bg-card p-6 shadow-xs text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h2 className="text-base font-bold text-foreground">Assessment Session Error</h2>
          <p className="text-xs sm:text-sm text-muted">{error || 'No questions available.'}</p>
          <div className="flex gap-2 justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/assessments')}
              className="text-xs"
            >
              Back to Overview
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={loadQuestions}
              className="text-xs gap-1.5 bg-primary text-primary-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between text-foreground">
      {/* Top Session Header */}
      <AssessmentSessionHeader
        moduleTitle={config.title}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        savingStatus={savingStatus}
      />

      {/* Main Focused Question Container (max-width around 850px) */}
      <main className="flex-1 w-full max-w-[850px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-7">
        {/* Progress & Metadata Bar */}
        <AssessmentProgressBar
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          subject={currentQuestion.subject}
          topic={currentQuestion.topic}
          difficulty={currentQuestion.difficulty}
        />

        {/* Dynamic Question Render by Module Type */}
        {validModuleId === 'behavioural' ? (
          <LikertQuestionView
            question={currentQuestion}
            statementNumber={currentIndex + 1}
            selectedValue={currentResponse?.response_value ?? null}
            onSelectRating={(val) => handleSaveResponse({ response_value: val })}
          />
        ) : validModuleId === 'situational' ? (
          <SituationalQuestionView
            question={currentQuestion}
            scenarioNumber={currentIndex + 1}
            selectedOptionId={currentResponse?.selected_option_id ?? null}
            onSelectOption={(optId, optText) =>
              handleSaveResponse({
                selected_option_id: optId,
                selected_option_text: optText,
              })
            }
          />
        ) : (
          /* Default: Academic & Aptitude MCQ View */
          <MCQQuestionView
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedOptionId={currentResponse?.selected_option_id ?? null}
            onSelectOption={(optId, optText) =>
              handleSaveResponse({
                selected_option_id: optId,
                selected_option_text: optText,
              })
            }
          />
        )}

        {/* Question Navigator Numbers (1..N) */}
        <div className="pt-4 border-t border-border/60">
          <QuestionNavigator
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answeredIndices={answeredIndices}
            onSelectIndex={(idx) => {
              setCurrentIndex(idx)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <SessionBottomBar
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        isFirstQuestion={currentIndex === 0}
        isLastQuestion={currentIndex === questions.length - 1}
        isAnswered={answeredIndices.has(currentIndex)}
        isSaving={savingStatus === 'saving'}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onReview={handleReview}
      />
    </div>
  )
}
