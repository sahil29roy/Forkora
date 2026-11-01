import { useMemo } from 'react'
import { GraduationCap, ChevronDown, Calendar } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { EDUCATION_BOARD_OPTIONS } from '@/validators/class10Academic.schema'
import type { Class10AcademicData, Class10FormErrors } from '@/types/academicOnboarding.types'

interface BoardInformationSectionProps {
  data: Class10AcademicData
  onChange: (updated: Partial<Class10AcademicData>) => void
  errors: Class10FormErrors
  disabled?: boolean
}

export function BoardInformationSection({
  data,
  onChange,
  errors,
  disabled = false,
}: BoardInformationSectionProps) {
  // Dynamically generate passing years around the current academic year
  const passingYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years: Array<{ value: number; label: string }> = []

    // Previous 2 years, current year, next 4 years
    for (let yr = currentYear - 2; yr <= currentYear + 4; yr++) {
      let label = `${yr}`
      if (yr === currentYear) {
        label = `${yr} (Current Academic Year)`
      } else if (yr === currentYear + 1) {
        label = `${yr} (Upcoming Year)`
      }
      years.push({ value: yr, label })
    }
    return years
  }, [])

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-4 w-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Board Information
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Provide your secondary school board details and passing year.
        </p>
      </div>

      {/* Card Container */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Field 1: Education Board */}
          <div className="space-y-1.5">
            <Label htmlFor="education-board" className="text-xs font-semibold text-foreground">
              Education Board <span className="text-primary">*</span>
            </Label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted z-10">
                <GraduationCap className="h-4 w-4 stroke-[1.8]" />
              </div>
              <select
                id="education-board"
                value={data.educationBoard}
                onChange={(e) => {
                  const newBoard = e.target.value
                  onChange({
                    educationBoard: newBoard,
                    customBoardName: newBoard === 'Other' ? data.customBoardName : '',
                  })
                }}
                disabled={disabled}
                aria-invalid={Boolean(errors.educationBoard)}
                className={cn(
                  'w-full h-11 pl-10 pr-9 rounded-lg border text-xs sm:text-sm bg-background text-foreground transition-all duration-150 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50',
                  errors.educationBoard ? 'border-destructive ring-destructive/20' : 'border-border',
                  !data.educationBoard && 'text-muted-foreground'
                )}
              >
                <option value="" disabled className="bg-card text-muted">
                  Select your board
                </option>
                {EDUCATION_BOARD_OPTIONS.map((board) => (
                  <option key={board} value={board} className="bg-card text-foreground py-1">
                    {board}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 flex items-center justify-center text-muted">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            {errors.educationBoard && (
              <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
                {errors.educationBoard}
              </p>
            )}
          </div>

          {/* Field 2: Passing Year / Expected Year */}
          <div className="space-y-1.5">
            <Label htmlFor="passing-year" className="text-xs font-semibold text-foreground">
              Passing Year / Expected Year <span className="text-primary">*</span>
            </Label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted z-10">
                <Calendar className="h-4 w-4 stroke-[1.8]" />
              </div>
              <select
                id="passing-year"
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
                  Select passing year
                </option>
                {passingYearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-card text-foreground py-1">
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 flex items-center justify-center text-muted">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            {errors.passingYear && (
              <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
                {errors.passingYear}
              </p>
            )}
          </div>
        </div>

        {/* Conditional Field: Other Board Name */}
        {data.educationBoard === 'Other' && (
          <div className="pt-1 space-y-1.5 animate-fade-in">
            <Label htmlFor="custom-board-name" className="text-xs font-semibold text-foreground">
              Enter your board name <span className="text-primary">*</span>
            </Label>
            <Input
              id="custom-board-name"
              type="text"
              placeholder="e.g., Maharashtra State Board, NIOS Regional, Texas State Board"
              value={data.customBoardName}
              onChange={(e) => onChange({ customBoardName: e.target.value })}
              disabled={disabled}
              aria-invalid={Boolean(errors.customBoardName)}
              className={cn(
                'h-11 text-xs sm:text-sm bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
                errors.customBoardName && 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive'
              )}
            />
            {errors.customBoardName && (
              <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
                {errors.customBoardName}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
