import { Pencil, School, BookOpen, Layers, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubjectPerformanceTable } from './SubjectPerformanceTable'
import type { ReviewAcademicData } from '@/types/reviewOnboarding.types'

interface AcademicInformationReviewProps {
  currentClass: number
  academic: ReviewAcademicData
  onEdit: () => void
}

export function AcademicInformationReview({
  currentClass,
  academic,
  onEdit,
}: AcademicInformationReviewProps) {
  const isHigherSecondary = currentClass >= 11

  // Format study status
  const formatStudyStatus = (status: string) => {
    if (!status) return 'Not provided'
    if (status.toUpperCase() === 'CURRENTLY_STUDYING') return 'Currently Studying'
    if (status.toUpperCase() === 'PASSED') return 'Passed'
    return status
  }

  const displayBoard = academic.customBoardName?.trim() || academic.educationBoard?.trim() || 'Not provided'
  const displayStream = academic.customStreamName?.trim() || academic.stream?.trim() || 'Not provided'
  const displayCombination = academic.subjectCombination?.trim() || 'Not specified'

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5 transition-colors">
      {/* Header with Title, Description, and Edit Button */}
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1 text-left">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Academic Information
          </h3>
          <p className="text-xs sm:text-sm text-muted">
            Your education board, subjects and academic performance.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-primary hover:text-primary/90 hover:bg-primary/10 gap-1.5 text-xs font-semibold rounded-lg shrink-0 h-8 px-2.5 sm:px-3"
          aria-label="Edit Academic Information"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
      </div>

      {/* Academic Metadata Grid */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          isHigherSecondary ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        } gap-3 sm:gap-4 text-left`}
      >
        {/* Education Board */}
        <div className="p-3 sm:p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-1">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
            <School className="h-3 w-3 text-primary/70 shrink-0" />
            Education Board
          </span>
          <p className="text-xs sm:text-sm font-semibold text-foreground break-words">
            {displayBoard}
          </p>
        </div>

        {/* Current Class */}
        <div className="p-3 sm:p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-1">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
            <BookOpen className="h-3 w-3 text-primary/70 shrink-0" />
            Current Class
          </span>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Class {currentClass}
          </p>
        </div>

        {/* Conditional Stream & Combination: Only for Class 11 and 12 */}
        {isHigherSecondary && (
          <>
            <div className="p-3 sm:p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-1">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-primary/70 shrink-0" />
                Stream
              </span>
              <p className="text-xs sm:text-sm font-semibold text-foreground break-words">
                {displayStream}
              </p>
            </div>

            {displayCombination !== 'Not specified' && (
              <div className="p-3 sm:p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-1">
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-primary/70 shrink-0" />
                  Combination
                </span>
                <p className="text-xs sm:text-sm font-semibold text-foreground break-words">
                  {displayCombination}
                </p>
              </div>
            )}
          </>
        )}

        {/* Study Status */}
        <div className="p-3 sm:p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-1">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-primary/70 shrink-0" />
            Study Status
          </span>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            {formatStudyStatus(academic.studyStatus)}
          </p>
        </div>

        {/* Passing / Expected Year */}
        <div className="p-3 sm:p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-1">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-primary/70 shrink-0" />
            Passing Year
          </span>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            {academic.passingYear ? String(academic.passingYear) : 'Not provided'}
          </p>
        </div>
      </div>

      {/* Subject Performance Sub-Section */}
      <div className="space-y-3 pt-2 text-left">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
            Subject Performance
          </h4>
          <span className="text-[11px] text-muted-foreground">
            {academic.subjects?.length || 0} subject{academic.subjects?.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {/* Responsive Subject Performance Table */}
        <SubjectPerformanceTable subjects={academic.subjects} />
      </div>
    </div>
  )
}
