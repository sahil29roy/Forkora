import { UserCheck, Briefcase } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ParentDetailsCardProps {
  idPrefix: string
  title: string
  nameValue: string
  occupationValue: string
  onNameChange: (val: string) => void
  onOccupationChange: (val: string) => void
  nameError?: string
  disabled?: boolean
}

export function ParentDetailsCard({
  idPrefix,
  title,
  nameValue,
  occupationValue,
  onNameChange,
  onOccupationChange,
  nameError,
  disabled = false,
}: ParentDetailsCardProps) {
  const nameId = `${idPrefix}-name`
  const occupationId = `${idPrefix}-occupation`

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4 transition-colors hover:border-border/80">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/40">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserCheck className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground tracking-tight">{title}</h4>
          <p className="text-[11px] text-muted">Primary or secondary guardian</p>
        </div>
      </div>

      {/* Parent Full Name Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={nameId} className="text-xs font-semibold text-foreground">
            Parent Name <span className="text-primary">*</span>
          </Label>
        </div>
        <Input
          id={nameId}
          type="text"
          placeholder="Enter parent name"
          value={nameValue}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(nameError)}
          className={cn(
            'h-10 text-xs sm:text-sm bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
            nameError && 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive'
          )}
        />
        {nameError && (
          <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
            {nameError}
          </p>
        )}
      </div>

      {/* Parent Occupation Input (Free-form text input) */}
      <div className="space-y-1.5">
        <Label htmlFor={occupationId} className="text-xs font-semibold text-foreground flex items-center justify-between">
          <span>Occupation</span>
          <span className="text-[11px] font-normal text-muted">Optional</span>
        </Label>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-3 flex items-center justify-center text-muted">
            <Briefcase className="h-3.5 w-3.5 stroke-[1.8]" />
          </div>
          <Input
            id={occupationId}
            type="text"
            placeholder="Enter occupation (optional)"
            value={occupationValue}
            onChange={(e) => onOccupationChange(e.target.value)}
            disabled={disabled}
            className="pl-9 h-10 text-xs sm:text-sm bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
          />
        </div>
      </div>
    </div>
  )
}
