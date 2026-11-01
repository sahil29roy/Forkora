import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AssessmentSessionHeaderProps {
  moduleTitle: string
  currentIndex: number
  totalQuestions: number
  savingStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

export function AssessmentSessionHeader({
  moduleTitle,
  currentIndex,
  totalQuestions,
  savingStatus = 'idle',
}: AssessmentSessionHeaderProps) {
  const navigate = useNavigate()
  const [showExitDialog, setShowExitDialog] = useState<boolean>(false)

  const handleExit = () => {
    navigate('/assessments')
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-background/90 backdrop-blur-md border-b border-border/70 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Branding & Module */}
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-base tracking-tight text-primary">
            Forkora
          </span>
          <span className="text-border">|</span>
          <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[160px] sm:max-w-xs">
            {moduleTitle}
          </span>
        </div>

        {/* Question Counter & Auto-save Status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center text-xs text-muted-foreground gap-2">
            {savingStatus === 'saving' && (
              <span className="text-primary animate-pulse text-[11px]">Saving...</span>
            )}
            {savingStatus === 'saved' && (
              <span className="text-success text-[11px]">Saved</span>
            )}
            {savingStatus === 'error' && (
              <span className="text-destructive text-[11px]">Save failed</span>
            )}
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-muted/20 border border-border/60 text-xs font-semibold text-foreground">
            {currentIndex + 1} / {totalQuestions}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowExitDialog(true)}
            className="h-8 px-2.5 rounded-lg border-border/80 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            aria-label="Exit assessment"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>
      </header>

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 text-left">
            <div className="flex items-center gap-3 text-foreground">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Exit Assessment?</h3>
                <p className="text-xs text-muted">Your answered questions are securely saved.</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              You can resume this assessment anytime from the Assessment Overview screen.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowExitDialog(false)}
                className="h-9 px-4 rounded-xl border-border text-xs font-medium"
              >
                Keep Going
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleExit}
                className="h-9 px-4 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-medium"
              >
                Exit to Overview
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
