import { BookOpen, AlertCircle, Info } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { SubjectItem, AcademicFormErrors, StudyStatus } from '@/types/academicInformation.types'

interface SubjectMarksTableProps {
  subjects: SubjectItem[]
  studyStatus: StudyStatus
  onSubjectMarkChange: (subjectId: string, marksObtained: number | '') => void
  onSubjectMaxMarksChange: (subjectId: string, maximumMarks: number) => void
  errors: AcademicFormErrors
  disabled?: boolean
}

export function SubjectMarksTable({
  subjects,
  studyStatus,
  onSubjectMarkChange,
  onSubjectMaxMarksChange,
  errors,
  disabled = false,
}: SubjectMarksTableProps) {
  const subjectErrors = errors.subjects || {}

  const handleMarksInput = (id: string, rawVal: string) => {
    if (rawVal === '') {
      onSubjectMarkChange(id, '')
      return
    }
    const parsed = Number(rawVal)
    if (Number.isNaN(parsed)) return
    // Allow non-negative values
    if (parsed < 0) return
    onSubjectMarkChange(id, parsed)
  }

  const handleMaxMarksInput = (id: string, rawVal: string) => {
    const parsed = Number(rawVal)
    if (Number.isNaN(parsed) || parsed <= 0) return
    onSubjectMaxMarksChange(id, parsed)
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Subject Marks
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Enter the marks for the subjects you are currently studying (or have completed).
        </p>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
        {/* Study-Status Assessment Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted-bg/60 border border-border/80 text-xs text-muted">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            {studyStatus === 'CURRENTLY_STUDYING' ? (
              <span>
                <strong className="text-foreground">Latest Available Assessment:</strong> Enter marks from your latest term exam, unit test, or internal evaluation. Final exam marks are not required if you haven't taken them yet.
              </span>
            ) : (
              <span>
                <strong className="text-foreground">Completed Board Results:</strong> Enter your official final examination marks obtained and the maximum marks for each subject.
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Subjects Marks Rows */}
        <div className="space-y-3">
          {/* Header Row (Desktop) */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 pb-2 border-b border-border text-[11px] font-bold text-muted uppercase tracking-wider">
            <div className="col-span-6">Subject</div>
            <div className="col-span-3">Marks Obtained</div>
            <div className="col-span-3">Maximum Marks</div>
          </div>

          {subjects.map((sub) => {
            const err = subjectErrors[sub.id]
            const hasError = Boolean(err)

            return (
              <div
                key={sub.id}
                className={cn(
                  'p-3 sm:p-2.5 rounded-xl border transition-all',
                  hasError
                    ? 'border-destructive/60 bg-destructive/5'
                    : 'border-border/70 bg-background/50 hover:bg-background/90'
                )}
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Subject Name Column */}
                  <div className="sm:col-span-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs sm:text-sm font-semibold text-foreground">
                        {sub.subjectName}
                      </span>
                      {sub.isRequired ? (
                        <span className="text-primary font-bold ml-1">*</span>
                      ) : (
                        <span className="text-[11px] font-normal text-muted ml-1.5">(Optional)</span>
                      )}
                    </div>
                    <span className="sm:hidden text-[10px] text-muted uppercase font-bold bg-muted-bg px-2 py-0.5 rounded">
                      {sub.subjectCategory}
                    </span>
                  </div>

                  {/* Marks Obtained Input */}
                  <div className="sm:col-span-3 space-y-1">
                    <Label className="sm:hidden text-[11px] font-semibold text-muted">
                      Marks Obtained
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      min={0}
                      max={sub.maximumMarks || 100}
                      placeholder={studyStatus === 'PASSED' ? 'Marks *' : 'Marks (Optional)'}
                      value={sub.marksObtained}
                      onChange={(e) => handleMarksInput(sub.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-'].includes(e.key)) {
                          e.preventDefault()
                        }
                      }}
                      disabled={disabled}
                      aria-invalid={Boolean(err?.marks)}
                      className={cn(
                        'h-10 text-xs sm:text-sm font-semibold bg-card border-border tracking-tight focus-visible:ring-2 focus-visible:ring-primary/20',
                        err?.marks && 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive'
                      )}
                    />
                  </div>

                  {/* Maximum Marks Input */}
                  <div className="sm:col-span-3 space-y-1">
                    <Label className="sm:hidden text-[11px] font-semibold text-muted">
                      Maximum Marks
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      placeholder="Max"
                      value={sub.maximumMarks}
                      onChange={(e) => handleMaxMarksInput(sub.id, e.target.value)}
                      disabled={disabled}
                      aria-invalid={Boolean(err?.maxMarks)}
                      className={cn(
                        'h-10 text-xs sm:text-sm font-semibold bg-card border-border text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20',
                        err?.maxMarks && 'border-destructive focus-visible:ring-destructive/20'
                      )}
                    />
                  </div>
                </div>

                {/* Inline Errors */}
                {(err?.marks || err?.maxMarks || err?.name) && (
                  <div className="pt-1.5 flex items-center gap-1.5 text-xs text-destructive font-medium animate-fade-in">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{err?.marks || err?.maxMarks || err?.name}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
