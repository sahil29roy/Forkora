import { CheckCircle2, GraduationCap, School, Calendar, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AcademicSummaryBarProps {
  currentClass: number
  educationBoard: string
  customBoardName?: string | null
  stream?: string | null
  customStreamName?: string | null
  subjectCombination?: string | null
  passingYear: number | string
  isComplete: boolean
  className?: string
}

export function AcademicSummaryBar({
  currentClass,
  educationBoard,
  customBoardName,
  stream,
  customStreamName,
  subjectCombination,
  passingYear,
  isComplete,
  className,
}: AcademicSummaryBarProps) {
  const isHigherSecondary = currentClass >= 11
  const displayBoard = customBoardName?.trim() || educationBoard?.trim() || 'Board'
  const displayStream = customStreamName?.trim() || stream?.trim() || ''

  // Format stream & combination (e.g., "Science (PCM)" or "Commerce")
  let streamLabel = ''
  if (isHigherSecondary && displayStream) {
    if (subjectCombination && subjectCombination.trim()) {
      streamLabel = `${displayStream} (${subjectCombination.trim()})`
    } else {
      streamLabel = displayStream
    }
  }

  return (
    <div
      className={cn(
        'w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xs shadow-xs',
        'flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm',
        className
      )}
    >
      {/* Information items */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3.5 text-muted-foreground">
        {/* Student Category & Class */}
        <div className="inline-flex items-center gap-1.5 font-semibold text-foreground">
          <GraduationCap className="h-4 w-4 text-primary shrink-0" />
          <span>Student · Class {currentClass}</span>
        </div>

        {/* Stream & Combination (Class 11 & 12 only) */}
        {isHigherSecondary && streamLabel && (
          <>
            <span className="hidden sm:inline-block h-3.5 w-[1px] bg-border" aria-hidden="true" />
            <div className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
              <BookOpen className="h-3.5 w-3.5 text-primary/80 shrink-0" />
              <span>{streamLabel}</span>
            </div>
          </>
        )}

        {/* Education Board */}
        {displayBoard && (
          <>
            <span className="hidden sm:inline-block h-3.5 w-[1px] bg-border" aria-hidden="true" />
            <div className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
              <School className="h-3.5 w-3.5 text-primary/80 shrink-0" />
              <span>{displayBoard}</span>
            </div>
          </>
        )}

        {/* Passing / Expected Year */}
        {passingYear && (
          <>
            <span className="hidden sm:inline-block h-3.5 w-[1px] bg-border" aria-hidden="true" />
            <div className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
              <span>Passing: {passingYear}</span>
            </div>
          </>
        )}
      </div>

      {/* Completion Indicator */}
      <div className="shrink-0">
        {isComplete ? (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 font-semibold gap-1.5 py-1 px-2.5 sm:px-3 text-[11px] sm:text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>All Details Added</span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 font-semibold gap-1.5 py-1 px-2.5 sm:px-3 text-[11px] sm:text-xs"
          >
            <span>In Progress</span>
          </Badge>
        )}
      </div>
    </div>
  )
}
