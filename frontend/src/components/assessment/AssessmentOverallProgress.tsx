import { CheckCircle2, Clock, CircleDot } from 'lucide-react'
import type { ModuleProgressDTO } from '@/types/assessment.types'

interface AssessmentOverallProgressProps {
  modules: ModuleProgressDTO[]
}

export function AssessmentOverallProgress({ modules }: AssessmentOverallProgressProps) {
  const totalAvailable = modules.reduce((sum, m) => sum + (m.total_questions || 0), 0) || 35
  const totalCompleted = modules.reduce((sum, m) => sum + (m.answered_count || 0), 0)
  const completedModulesCount = modules.filter((m) => m.status === 'COMPLETED').length
  const inProgressModulesCount = modules.filter((m) => m.status === 'IN_PROGRESS').length
  const overallPercentage = Math.round((totalCompleted / totalAvailable) * 100)

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs text-left space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Overall Assessment Progress
          </h3>
          <p className="text-xs sm:text-sm text-muted">
            Track your progress across all four assessment areas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-primary">
            {overallPercentage}%
          </span>
          <span className="text-xs text-muted-foreground">
            ({totalCompleted}/{totalAvailable} completed)
          </span>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, overallPercentage))}%` }}
        />
      </div>

      {/* Module Status Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {modules.map((mod) => {
          const isDone = mod.status === 'COMPLETED'
          const isInProg = mod.status === 'IN_PROGRESS'

          return (
            <div
              key={mod.module_id}
              className={`p-3 rounded-xl border flex flex-col justify-between text-left transition-colors ${
                isDone
                  ? 'bg-success/5 border-success/20'
                  : isInProg
                  ? 'bg-primary/5 border-primary/25'
                  : 'bg-muted/10 border-border/60'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-foreground truncate">
                  {mod.title.replace(' Assessment', '')}
                </span>
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                ) : isInProg ? (
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                ) : (
                  <CircleDot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
              </div>

              <span className="text-[11px] text-muted-foreground">
                {isDone
                  ? 'Completed'
                  : isInProg
                  ? `${mod.answered_count}/${mod.total_questions} answered`
                  : 'Not Started'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Completion Banner if all 4 are done */}
      {completedModulesCount === 4 && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex items-center gap-3 text-xs sm:text-sm text-success font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            Congratulations! You have completed all 4 assessment modules. Your comprehensive profile is ready.
          </span>
        </div>
      )}
    </section>
  )
}
