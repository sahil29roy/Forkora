import { ArrowRight, Clock, HelpCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AssessmentModule } from '@/types/assessment.types'

interface AssessmentModuleCardProps {
  module: AssessmentModule
  onSelect?: (module: AssessmentModule) => void
}

export function AssessmentModuleCard({ module, onSelect }: AssessmentModuleCardProps) {
  const Icon = module.icon

  // Check if dynamic metadata is provided by backend API
  const hasMetadata =
    module.questionCount !== undefined ||
    module.estimatedDuration !== undefined ||
    module.status !== undefined

  const isCompleted = module.status === 'COMPLETED'
  const isInProgress = module.status === 'IN_PROGRESS'

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between text-left group">
      <div className="space-y-4">
        {/* Top Icon and Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform duration-200">
            <Icon className="h-5 w-5" />
          </div>

          {/* Render dynamic status badge ONLY if dynamic metadata is present */}
          {hasMetadata && module.status && (
            <div>
              {isCompleted && (
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success border-success/25 font-semibold text-[11px] gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Completed</span>
                </Badge>
              )}
              {isInProgress && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/25 font-semibold text-[11px]"
                >
                  In Progress
                </Badge>
              )}
              {!isCompleted && !isInProgress && (
                <Badge
                  variant="outline"
                  className="bg-muted/30 text-muted-foreground border-border text-[11px]"
                >
                  Not Started
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
            {module.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            {module.description}
          </p>
        </div>
      </div>

      {/* Bottom Metadata & Action */}
      <div className="pt-5 mt-4 border-t border-border/50 space-y-3">
        {hasMetadata ? (
          // Dynamic fields rendered only when provided by backend
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {module.questionCount !== undefined && (
              <span className="flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-primary/70" />
                <span>{module.questionCount} Questions</span>
              </span>
            )}
            {module.estimatedDuration !== undefined && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
                <span>~{module.estimatedDuration} mins</span>
              </span>
            )}
          </div>
        ) : (
          // Neutral message when dynamic backend metadata is not yet connected
          <p className="text-[11px] text-muted-foreground/75 italic">
            Assessment details will be available soon.
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => onSelect?.(module)}
          className="w-full h-9 rounded-xl border-border/80 hover:border-primary/50 hover:bg-primary/5 hover:text-primary font-semibold text-xs justify-between group/btn transition-colors cursor-pointer"
        >
          <span>{isCompleted ? 'Review Responses' : 'Start Module'}</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover/btn:text-primary group-hover/btn:translate-x-0.5 transition-all" />
        </Button>
      </div>
    </div>
  )
}
