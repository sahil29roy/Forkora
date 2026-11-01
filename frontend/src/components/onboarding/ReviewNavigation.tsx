import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReviewNavigationProps {
  onBack: () => void
  onConfirm: () => void
  isSubmitting: boolean
  isSuccess?: boolean
  className?: string
}

export function ReviewNavigation({
  onBack,
  onConfirm,
  isSubmitting,
  isSuccess = false,
  className = '',
}: ReviewNavigationProps) {
  return (
    <div
      className={`pt-6 border-t border-border/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-3.5 sm:gap-4 ${className}`}
    >
      {/* Left Back Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isSubmitting || isSuccess}
        className="w-full sm:w-auto gap-2 text-xs sm:text-sm font-semibold rounded-xl border-border hover:bg-muted/60 transition-all h-11 px-5"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Academic Info</span>
      </Button>

      {/* Right Confirm & Continue Button */}
      <Button
        type="button"
        onClick={onConfirm}
        disabled={isSubmitting || isSuccess}
        className="w-full sm:w-auto gap-2 text-xs sm:text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 transition-all h-11 px-6"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Confirming Profile...</span>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-white" />
            <span>Profile Confirmed!</span>
          </>
        ) : (
          <>
            <span>Confirm & Continue</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}
