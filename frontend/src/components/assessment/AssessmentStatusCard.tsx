import { BarChart3, Sparkles } from 'lucide-react'
import type { AssessmentStatusData } from '@/types/assessment.types'

interface AssessmentStatusCardProps {
  statusData?: AssessmentStatusData
}

export function AssessmentStatusCard({ statusData }: AssessmentStatusCardProps) {
  // Check if live backend status data is provided
  const hasLiveStatus =
    statusData?.overallProgress !== undefined ||
    statusData?.completedModules !== undefined

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4 text-left">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>Your Assessment Status</span>
        </h3>
      </div>

      {hasLiveStatus ? (
        // When backend integration delivers actual progress
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-muted">Overall Progress</span>
            <span className="text-primary font-bold">
              {statusData.overallProgress ?? 0}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${statusData.overallProgress ?? 0}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
              <span className="text-muted-foreground block text-[11px]">Completed</span>
              <span className="text-base font-bold text-foreground">
                {statusData.completedModules ?? 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
              <span className="text-muted-foreground block text-[11px]">Remaining</span>
              <span className="text-base font-bold text-foreground">
                {(statusData.totalModules ?? 4) - (statusData.completedModules ?? 0)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Neutral initial state (strict compliance: no invented percentages or progress values)
        <div className="py-6 px-3 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Sparkles className="h-6 w-6" />
          </div>

          <div className="space-y-1 max-w-xs">
            <h4 className="text-sm font-bold text-foreground">
              Your progress will appear here.
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              Start your assessments to track your progress and build your personal career profile.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
