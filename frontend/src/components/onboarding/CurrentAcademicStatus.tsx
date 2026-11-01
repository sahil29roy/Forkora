import { useMemo } from 'react'
import { GraduationCap, Calendar, CheckCircle2, BookOpen } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AcademicInformationData, AcademicFormErrors, StudyStatus } from '@/types/academicInformation.types'

interface CurrentAcademicStatusProps {
  data: AcademicInformationData
  onChange: (updated: Partial<AcademicInformationData>) => void
  errors: AcademicFormErrors
  disabled?: boolean
}

export function CurrentAcademicStatus({
  data,
  onChange,
  errors,
  disabled = false,
}: CurrentAcademicStatusProps) {
  // Dynamically generate passing / expected years around current academic year
  const passingYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years: Array<{ value: number; label: string }> = []

    // Show previous 3 years to next 4 years
    for (let yr = currentYear - 3; yr <= currentYear + 4; yr++) {
      let label = `${yr}`
      if (yr === currentYear) {
        label = data.studyStatus === 'PASSED' ? `${yr} (Current Year)` : `${yr} (Expected This Year)`
      } else if (yr === currentYear + 1) {
        label = `${yr} (Upcoming Academic Year)`
      } else if (yr === currentYear - 1 && data.studyStatus === 'PASSED') {
        label = `${yr} (Previous Year)`
      }
      years.push({ value: yr, label })
    }
    return years
  }, [data.studyStatus])

  const setStatus = (status: StudyStatus) => {
    if (disabled) return
    onChange({ studyStatus: status })
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-4 w-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Current Academic Status
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Your current school stage and completion timeline.
        </p>
      </div>

      {/* Card Container */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
        {/* Read-Only Contextual Class Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/15">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted">Enrolled Level</div>
              <div className="text-sm font-bold text-foreground tracking-tight">
                Current Class: Class {data.currentClass}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card border border-border text-[11px] font-medium text-muted">
            <span>Verified from your profile</span>
          </div>
        </div>

        {/* 2-Column Responsive Row: Study Status + Passing/Expected Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Study Status Segmented Control */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Study Status <span className="text-primary">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2 h-11 p-1 rounded-lg bg-background border border-border">
              <button
                type="button"
                onClick={() => setStatus('CURRENTLY_STUDYING')}
                disabled={disabled}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all select-none',
                  data.studyStatus === 'CURRENTLY_STUDYING'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted hover:text-foreground'
                )}
              >
                {data.studyStatus === 'CURRENTLY_STUDYING' && <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>Currently Studying</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('PASSED')}
                disabled={disabled}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all select-none',
                  data.studyStatus === 'PASSED'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted hover:text-foreground'
                )}
              >
                {data.studyStatus === 'PASSED' && <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>Passed</span>
              </button>
            </div>
            {errors.studyStatus && (
              <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
                {errors.studyStatus}
              </p>
            )}
          </div>

          {/* Passing Year / Expected Year Dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="academic-year-select" className="text-xs font-semibold text-foreground">
              {data.studyStatus === 'PASSED' ? 'Passing Year' : 'Expected Completion Year'}{' '}
              <span className="text-primary">*</span>
            </Label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted z-10">
                <Calendar className="h-4 w-4 stroke-[1.8]" />
              </div>
              <select
                id="academic-year-select"
                value={data.passingYear}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : ''
                  onChange({ passingYear: val })
                }}
                disabled={disabled}
                aria-invalid={Boolean(errors.passingYear)}
                className={cn(
                  'w-full h-11 pl-10 pr-9 rounded-lg border text-xs sm:text-sm bg-background text-foreground transition-all duration-150 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50',
                  errors.passingYear ? 'border-destructive ring-destructive/20' : 'border-border',
                  !data.passingYear && 'text-muted-foreground'
                )}
              >
                <option value="" disabled className="bg-card text-muted">
                  Select year
                </option>
                {passingYearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-card text-foreground py-1">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.passingYear && (
              <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
                {errors.passingYear}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
