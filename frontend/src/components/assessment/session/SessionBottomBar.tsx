import { ChevronLeft, ChevronRight, CheckCircle2, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SessionBottomBarProps {
  currentIndex: number
  totalQuestions: number
  isFirstQuestion: boolean
  isLastQuestion: boolean
  isAnswered: boolean
  isSaving: boolean
  onPrevious: () => void
  onNext: () => void
  onReview: () => void
}

export function SessionBottomBar({
  currentIndex,
  totalQuestions,
  isFirstQuestion,
  isLastQuestion,
  isSaving,
  onPrevious,
  onNext,
  onReview,
}: SessionBottomBarProps) {
  return (
    <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur-md border-t border-border/70 py-4 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Previous Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isFirstQuestion}
        onClick={onPrevious}
        className="h-10 px-4 rounded-xl border-border text-xs font-semibold gap-1.5 cursor-pointer disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Center Saving Feedback Indicator */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground select-none">
        {isSaving ? (
          <>
            <RotateCw className="h-3.5 w-3.5 animate-spin text-primary" />
            <span className="text-[11px] text-primary">Saving answer...</span>
          </>
        ) : (
          <span className="text-[11px] text-muted-foreground/75">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        )}
      </div>

      {/* Next or Review Button */}
      {isLastQuestion ? (
        <Button
          type="button"
          onClick={onReview}
          className="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Review Assessment</span>
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          className="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Save & Continue</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
