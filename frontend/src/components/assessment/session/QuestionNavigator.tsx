interface QuestionNavigatorProps {
  totalQuestions: number
  currentIndex: number
  answeredIndices: Set<number>
  onSelectIndex: (index: number) => void
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answeredIndices,
  onSelectIndex,
}: QuestionNavigatorProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 select-none">
      {Array.from({ length: totalQuestions }, (_, idx) => {
        const isCurrent = idx === currentIndex
        const isAnswered = answeredIndices.has(idx)

        let buttonClasses = 'h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center '

        if (isCurrent) {
          buttonClasses += 'bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/40 ring-offset-2 ring-offset-background scale-105'
        } else if (isAnswered) {
          buttonClasses += 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25'
        } else {
          buttonClasses += 'bg-muted/15 text-muted-foreground border border-border/80 hover:bg-muted/30 hover:text-foreground'
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectIndex(idx)}
            className={buttonClasses}
            aria-label={`Go to question ${idx + 1}${isAnswered ? ' (Answered)' : ''}`}
            aria-current={isCurrent ? 'true' : undefined}
          >
            {idx + 1}
          </button>
        )
      })}
    </div>
  )
}
