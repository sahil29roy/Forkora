import { Badge } from '@/components/ui/badge'
import { LIKERT_OPTIONS } from '@/config/assessmentConfig'
import type { ClientSafeQuestion } from '@/types/assessment.types'

interface LikertQuestionViewProps {
  question: ClientSafeQuestion
  statementNumber: number
  selectedValue: number | null
  onSelectRating: (val: number) => void
}

export function LikertQuestionView({
  question,
  statementNumber,
  selectedValue,
  onSelectRating,
}: LikertQuestionViewProps) {
  const dimension = question.topic || 'Behavioural Tendency'

  return (
    <div className="space-y-6 text-left">
      {/* Statement Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-primary tracking-wider uppercase">
            Statement {statementNumber} of 10
          </span>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 font-semibold text-xs">
            {dimension}
          </Badge>
        </div>

        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground leading-relaxed pt-1">
          &ldquo;{question.question_text}&rdquo;
        </h2>

        <p className="text-xs text-muted-foreground pt-1 italic">
          Select the option that best describes how you naturally think, feel, or behave. There are no right or wrong answers.
        </p>
      </div>

      {/* 5-Point Likert Scale (Horizontal on Desktop, Stacked on Mobile) */}
      <div className="space-y-2">
        <div className="hidden sm:grid sm:grid-cols-5 gap-2.5" role="radiogroup" aria-label="Likert agreement scale">
          {LIKERT_OPTIONS.map((opt) => {
            const isSelected = selectedValue === opt.value

            return (
              <div
                key={opt.value}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onSelectRating(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    onSelectRating(opt.value)
                  }
                }}
                className={`p-3.5 rounded-xl border text-center transition-all duration-150 cursor-pointer flex flex-col items-center justify-between min-h-[105px] select-none ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs'
                    : 'border-border/80 bg-card text-foreground/80 hover:border-primary/40 hover:bg-muted/15'
                }`}
              >
                {/* Scale Number Circle */}
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-2 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/20 text-muted-foreground'
                  }`}
                >
                  {opt.value}
                </div>

                <span className="text-xs font-medium leading-tight">
                  {opt.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Mobile View: Vertical list */}
        <div className="sm:hidden space-y-2" role="radiogroup" aria-label="Likert agreement scale mobile">
          {LIKERT_OPTIONS.map((opt) => {
            const isSelected = selectedValue === opt.value

            return (
              <div
                key={opt.value}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onSelectRating(opt.value)}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                    : 'border-border/80 bg-card text-foreground/80 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    {opt.value}
                  </div>
                  <span className="text-xs font-medium">{opt.label}</span>
                </div>

                <div
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-primary' : 'border-muted/50'
                  }`}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
