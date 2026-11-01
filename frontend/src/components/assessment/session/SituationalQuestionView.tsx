import { Badge } from '@/components/ui/badge'
import { Briefcase } from 'lucide-react'
import type { ClientSafeQuestion } from '@/types/assessment.types'

interface SituationalQuestionViewProps {
  question: ClientSafeQuestion
  scenarioNumber: number
  selectedOptionId: number | string | null
  onSelectOption: (optionId: number | string, optionText: string) => void
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export function SituationalQuestionView({
  question,
  scenarioNumber,
  selectedOptionId,
  onSelectOption,
}: SituationalQuestionViewProps) {
  const category = question.topic || question.subject || 'Practical Decision-Making'

  // If question has explicit scenario_text, use it; otherwise question_text or extract prompt
  const scenarioText = question.scenario_text || question.question_text
  const promptQuestion = question.scenario_text ? question.question_text : 'How would you respond in this scenario?'

  return (
    <div className="space-y-6 text-left">
      {/* Distinct Scenario Description Card */}
      <div className="rounded-2xl border border-primary/20 bg-muted/20 p-6 sm:p-7 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-primary tracking-wider uppercase flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Scenario {scenarioNumber} of 5</span>
          </span>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 font-semibold text-xs">
            {category}
          </Badge>
        </div>

        <p className="text-sm sm:text-base text-foreground leading-relaxed font-normal">
          {scenarioText}
        </p>
      </div>

      {/* Decision Question Prompt */}
      <div className="space-y-1 px-1">
        <h3 className="text-sm sm:text-base font-bold text-foreground">
          {promptQuestion}
        </h3>
        <p className="text-xs text-muted-foreground">
          Consider the choices below and select the course of action you would most likely take.
        </p>
      </div>

      {/* 4 Selectable Action Options */}
      <div className="space-y-3" role="radiogroup" aria-label={`Scenario ${scenarioNumber} choices`}>
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
              className={`p-4 sm:p-5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-start justify-between gap-4 select-none ${
                isSelected
                  ? 'border-primary bg-primary/8 text-foreground ring-1 ring-primary shadow-xs'
                  : 'border-border/80 bg-card text-foreground/90 hover:border-primary/40 hover:bg-muted/15'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <span
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/20 text-muted-foreground'
                  }`}
                >
                  {letter}
                </span>

                <span className="text-xs sm:text-sm font-medium leading-relaxed break-words pt-0.5">
                  {opt.option_text}
                </span>
              </div>

              {/* Radio Indicator */}
              <div
                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
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
