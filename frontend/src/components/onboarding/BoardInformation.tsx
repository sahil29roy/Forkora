import { GraduationCap, ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { EDUCATION_BOARD_OPTIONS } from '@/config/interestCategories'
import type { AcademicInformationData, AcademicFormErrors } from '@/types/academicInformation.types'

interface BoardInformationProps {
  data: AcademicInformationData
  onChange: (updated: Partial<AcademicInformationData>) => void
  errors: AcademicFormErrors
  disabled?: boolean
}

export function BoardInformation({
  data,
  onChange,
  errors,
  disabled = false,
}: BoardInformationProps) {
  return (
    <div className="space-y-4">
      {/* Education Board Dropdown */}
      <div className="space-y-1.5">
        <Label htmlFor="education-board-select" className="text-xs font-semibold text-foreground">
          Education Board <span className="text-primary">*</span>
        </Label>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted z-10">
            <GraduationCap className="h-4 w-4 stroke-[1.8]" />
          </div>
          <select
            id="education-board-select"
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
              Select your education board
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

      {/* Conditional Other Board Text Input */}
      {data.educationBoard === 'Other' && (
        <div className="space-y-1.5 animate-fade-in">
          <Label htmlFor="custom-board-name" className="text-xs font-semibold text-foreground">
            Enter your board name <span className="text-primary">*</span>
          </Label>
          <Input
            id="custom-board-name"
            type="text"
            placeholder="e.g., Maharashtra State Board, NIOS, Texas Education Agency"
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
  )
}
