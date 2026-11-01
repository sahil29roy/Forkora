import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OnboardingNavigationProps {
  onBack: () => void
  onContinue?: () => void
  isSubmitting?: boolean
  disabled?: boolean
  submitButtonText?: string
}

export function OnboardingNavigation({
  onBack,
  onContinue,
  isSubmitting = false,
  disabled = false,
  submitButtonText = 'Continue to Review →',
}: OnboardingNavigationProps) {
  return (
    <div className="pt-6 sm:pt-8 border-t border-border/60 flex items-center justify-between gap-4">
      {/* Back Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isSubmitting || disabled}
        className="gap-2 h-11 px-5 rounded-xl border-border bg-card hover:bg-muted/30 text-foreground font-semibold text-xs sm:text-sm transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>

      {/* Continue to Review Button */}
      <Button
        type={onContinue ? 'button' : 'submit'}
        onClick={onContinue}
        disabled={isSubmitting || disabled}
        className="gap-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-md shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving Academic Info...</span>
          </>
        ) : (
          <>
            <span>{submitButtonText}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}
