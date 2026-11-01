import { Layers, ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { STREAM_COMBINATIONS } from '@/config/streamConfiguration'
import type { AcademicInformationData, AcademicFormErrors } from '@/types/academicInformation.types'

interface SubjectCombinationProps {
  data: AcademicInformationData
  onCombinationChange: (combinationId: string) => void
  errors: AcademicFormErrors
  disabled?: boolean
}

export function SubjectCombination({
  data,
  onCombinationChange,
  errors,
  disabled = false,
}: SubjectCombinationProps) {
  // Only rendered for Class 11 and Class 12 when a stream is selected
  if (data.currentClass <= 10 || !data.stream) {
    return null
  }

  const combinations = STREAM_COMBINATIONS[data.stream] || STREAM_COMBINATIONS['Other']

  return (
    <div className="space-y-1.5 animate-fade-in">
      <Label htmlFor="combination-select" className="text-xs font-semibold text-foreground">
        Subject Combination <span className="text-primary">*</span>
      </Label>
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted z-10">
          <Layers className="h-4 w-4 stroke-[1.8]" />
        </div>
        <select
          id="combination-select"
          value={data.subjectCombination}
          onChange={(e) => onCombinationChange(e.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors.subjectCombination)}
          className={cn(
            'w-full h-11 pl-10 pr-9 rounded-lg border text-xs sm:text-sm bg-background text-foreground transition-all duration-150 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50',
            errors.subjectCombination ? 'border-destructive ring-destructive/20' : 'border-border',
            !data.subjectCombination && 'text-muted-foreground'
          )}
        >
          <option value="" disabled className="bg-card text-muted">
            Select subject combination
          </option>
          {combinations.map((comb) => (
            <option key={comb.id} value={comb.id} className="bg-card text-foreground py-1">
              {comb.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 flex items-center justify-center text-muted">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {errors.subjectCombination && (
        <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
          {errors.subjectCombination}
        </p>
      )}
    </div>
  )
}
