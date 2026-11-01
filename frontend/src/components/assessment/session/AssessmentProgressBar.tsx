import { Badge } from '@/components/ui/badge'

interface AssessmentProgressBarProps {
  currentIndex: number
  totalQuestions: number
  subject?: string | null
  topic?: string | null
  difficulty?: string | null
}

export function AssessmentProgressBar({
  currentIndex,
  totalQuestions,
  subject,
  topic,
  difficulty,
}: AssessmentProgressBarProps) {
  const percentage = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0

  return (
    <div className="space-y-3 text-left">
      {/* Top Labels: Subject, Topic, Difficulty */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {subject && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 font-semibold text-xs">
              {subject}
            </Badge>
          )}
          {topic && (
            <span className="text-muted-foreground text-xs truncate max-w-[200px]">
              • {topic}
            </span>
          )}
        </div>

        {difficulty && (
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            {difficulty}
          </span>
        )}
      </div>

      {/* Animated Progress Bar */}
      <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
