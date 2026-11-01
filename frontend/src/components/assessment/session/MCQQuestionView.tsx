import type { ClientSafeQuestion } from '@/types/assessment.types'

interface MCQQuestionViewProps {
  question: ClientSafeQuestion
  questionNumber: number
  selectedOptionId: number | string | null
  onSelectOption: (optionId: number | string, optionText: string) => void
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export function MCQQuestionView({
  question,
  questionNumber,
  selectedOptionId,
  onSelectOption,
}: MCQQuestionViewProps) {
  return (
    <div className="space-y-6 text-left">
      {/* Question Header Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-3">
        <span className="text-xs font-bold text-primary tracking-wider uppercase">
          Question {questionNumber}
        </span>
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground leading-relaxed">
          {question.question_text}
        </h2>
      </div>

      {/* 4 Selectable Option Rows */}
      <div className="space-y-3" role="radiogroup" aria-label={`Question ${questionNumber} options`}>
        {question.options.map((opt, idx) => {
          const isSelected = String(selectedOptionId) === String(opt.option_id)
          const letter = OPTION_LETTERS[idx] || `${idx + 1}`

          return (
            <div
              key={opt.option_id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectOption(opt.option_id, opt.option_text)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onSelectOption(opt.option_id, opt.option_text)
                }
              }}
              className={`p-4 sm:p-4.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 select-none ${
                isSelected
                  ? 'border-primary bg-primary/8 text-foreground ring-1 ring-primary shadow-xs'
                  : 'border-border/80 bg-card text-foreground/90 hover:border-primary/40 hover:bg-muted/15'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/20 text-muted-foreground'
                  }`}
                >
                  {letter}
                </span>

                <span className="text-xs sm:text-sm font-medium leading-relaxed break-words">
                  {opt.option_text}
                </span>
              </div>

              {/* Radio Circle Indicator */}
              <div
                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'border-primary' : 'border-muted/50'
                }`}
              >
                {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
