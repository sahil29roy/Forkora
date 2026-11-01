import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock, HelpCircle, CheckCircle2, RotateCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ModuleProgressDTO } from '@/types/assessment.types'
import { ASSESSMENT_MODULE_CONFIGS } from '@/config/assessmentConfig'

interface AssessmentModuleCardProps {
  module: ModuleProgressDTO | any
  onRetry?: (moduleId: string) => void
  onSelect?: (module: any) => void
}

export function AssessmentModuleCard({ module, onRetry, onSelect }: AssessmentModuleCardProps) {
  const navigate = useNavigate()
  const moduleId = (module.module_id || module.id || 'academic').toLowerCase()
  const config = ASSESSMENT_MODULE_CONFIGS[moduleId as keyof typeof ASSESSMENT_MODULE_CONFIGS]
  const Icon = module.icon || config?.icon || HelpCircle

  const isCompleted = module.status === 'COMPLETED'
  const isInProgress = module.status === 'IN_PROGRESS'
  const isPreparing = module.status === 'PREPARING'
  const isFailed = module.status === 'FAILED'

  const handleAction = () => {
    if (isCompleted && module.attempt_id) {
      navigate(`/assessments/${module.module_id.toLowerCase()}/${module.attempt_id}/results`)
      return
    }

    if (isInProgress && module.attempt_id) {
      navigate(`/assessments/${module.module_id.toLowerCase()}/${module.attempt_id}`)
      return
    }

    if (isFailed && onRetry) {
      onRetry(module.module_id)
      return
    }

    // Default: Go to instructions
    navigate(`/assessments/${module.module_id.toLowerCase()}/instructions`)
  }

  const getButtonLabel = () => {
    if (isCompleted) return 'View Results'
    if (isInProgress) return 'Resume Assessment'
    if (isPreparing) return 'Preparing Questions...'
    if (isFailed) return 'Retry Assessment'
    return 'Start Assessment'
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between text-left group">
      <div className="space-y-4">
        {/* Top Header: Icon & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform duration-200">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            {isCompleted && (
              <Badge
                variant="outline"
                className="bg-success/10 text-success border-success/30 font-semibold text-xs gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Completed</span>
              </Badge>
            )}
            {isInProgress && (
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30 font-semibold text-xs"
              >
                In Progress ({module.progress_percentage}%)
              </Badge>
            )}
            {isPreparing && (
              <Badge
                variant="outline"
                className="bg-warning/10 text-warning border-warning/30 font-semibold text-xs gap-1 animate-pulse"
              >
                <RotateCw className="h-3 w-3 animate-spin" />
                <span>Preparing</span>
              </Badge>
            )}
            {isFailed && (
              <Badge
                variant="outline"
                className="bg-destructive/10 text-destructive border-destructive/30 font-semibold text-xs gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                <span>Failed</span>
              </Badge>
            )}
            {!isCompleted && !isInProgress && !isPreparing && !isFailed && (
              <Badge
                variant="outline"
                className="bg-muted/30 text-muted-foreground border-border text-xs"
              >
                Not Started
              </Badge>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
            {module.title || config?.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            {config?.description || module.description}
          </p>
        </div>

        {/* Progress Bar (Visible when in progress or completed) */}
        {(isInProgress || isCompleted) && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium text-foreground">
                {module.answered_count} of {module.total_questions} answered ({module.progress_percentage}%)
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-success' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, module.progress_percentage))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Metadata & Action Button */}
      <div className="pt-5 mt-4 border-t border-border/50 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-primary/70" />
            <span>{module.total_questions || config?.questionCount} Questions</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary/70" />
            <span>~{module.estimated_duration_minutes || config?.estimatedDuration} mins</span>
          </span>
        </div>

        <Button
          type="button"
          variant={isCompleted ? 'outline' : 'default'}
          disabled={isPreparing}
          onClick={handleAction}
          className={`w-full h-9 rounded-xl font-semibold text-xs justify-between group/btn cursor-pointer transition-all ${
            isCompleted
              ? 'border-border/80 hover:border-primary/50 hover:bg-primary/5 hover:text-primary'
              : 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-xs'
          }`}
        >
          <span>{getButtonLabel()}</span>
          <ArrowRight className="h-3.5 w-3.5 text-current group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
