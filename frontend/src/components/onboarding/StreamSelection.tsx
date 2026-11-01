import { GitBranch, ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { STREAM_OPTIONS } from '@/config/streamConfiguration'
import type { AcademicInformationData, AcademicFormErrors } from '@/types/academicInformation.types'

interface StreamSelectionProps {
  data: AcademicInformationData
  onStreamChange: (newStream: string) => void
  onCustomStreamChange: (name: string) => void
  errors: AcademicFormErrors
  disabled?: boolean
}

export function StreamSelection({
  data,
  onStreamChange,
  onCustomStreamChange,
  errors,
  disabled = false,
}: StreamSelectionProps) {
  // Only rendered for Class 11 and Class 12
  if (data.currentClass <= 10) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Stream Dropdown */}
      <div className="space-y-1.5">
        <Label htmlFor="stream-select" className="text-xs font-semibold text-foreground">
          Select Stream <span className="text-primary">*</span>
        </Label>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted z-10">
            <GitBranch className="h-4 w-4 stroke-[1.8]" />
          </div>
          <select
            id="stream-select"
            value={data.stream}
            onChange={(e) => onStreamChange(e.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.stream)}
            className={cn(
              'w-full h-11 pl-10 pr-9 rounded-lg border text-xs sm:text-sm bg-background text-foreground transition-all duration-150 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50',
              errors.stream ? 'border-destructive ring-destructive/20' : 'border-border',
              !data.stream && 'text-muted-foreground'
            )}
          >
            <option value="" disabled className="bg-card text-muted">
              Select your academic stream
            </option>
            {STREAM_OPTIONS.map((streamOpt) => (
              <option key={streamOpt} value={streamOpt} className="bg-card text-foreground py-1">
                {streamOpt}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 flex items-center justify-center text-muted">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {errors.stream && (
          <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
            {errors.stream}
          </p>
        )}
      </div>

      {/* Conditional Custom Stream Input */}
      {data.stream === 'Other' && (
        <div className="space-y-1.5 animate-fade-in">
          <Label htmlFor="custom-stream-name" className="text-xs font-semibold text-foreground">
            Enter your stream name <span className="text-primary">*</span>
          </Label>
          <Input
            id="custom-stream-name"
            type="text"
            placeholder="e.g., International Baccalaureate Diploma (IBDP), Applied Arts"
            value={data.customStreamName}
            onChange={(e) => onCustomStreamChange(e.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.customStreamName)}
            className={cn(
              'h-11 text-xs sm:text-sm bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
              errors.customStreamName && 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive'
            )}
          />
          {errors.customStreamName && (
            <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
              {errors.customStreamName}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
