import {
  Compass,
  Laptop,
  FlaskConical,
  Palette,
  TrendingUp,
  Stethoscope,
  Building2,
  Radio,
  Scale,
  GraduationCap,
  Trophy,
  Sprout,
  Sparkles,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { INTEREST_OPTIONS } from '@/validators/class10Academic.schema'
import type { Class10AcademicData, Class10FormErrors } from '@/types/academicOnboarding.types'

interface AreasOfInterestSectionProps {
  data: Class10AcademicData
  onChange: (updated: Partial<Class10AcademicData>) => void
  errors: Class10FormErrors
  disabled?: boolean
}

const INTEREST_ICONS: Record<string, React.ElementType> = {
  'Technology & Computers': Laptop,
  'Science & Innovation': FlaskConical,
  'Arts & Design': Palette,
  'Business & Entrepreneurship': TrendingUp,
  'Healthcare & Medicine': Stethoscope,
  'Government & Civil Services': Building2,
  'Media & Communication': Radio,
  'Law & Justice': Scale,
  'Teaching & Education': GraduationCap,
  'Sports & Fitness': Trophy,
  'Agriculture & Environment': Sprout,
  'Other': Sparkles,
}

export function AreasOfInterestSection({
  data,
  onChange,
  errors,
  disabled = false,
}: AreasOfInterestSectionProps) {
  const toggleInterest = (interest: string) => {
    if (disabled) return
    const isSelected = data.interests.includes(interest)
    let newInterests: string[]

    if (isSelected) {
      newInterests = data.interests.filter((i) => i !== interest)
    } else {
      newInterests = [...data.interests, interest]
    }

    onChange({
      interests: newInterests,
      customInterest: newInterests.includes('Other') ? data.customInterest : '',
    })
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Compass className="h-4 w-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Areas of Interest
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Select the areas you enjoy or are curious about. You can choose multiple options.
        </p>
      </div>

      {/* Multi-Select Grid Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
          {INTEREST_OPTIONS.map((option) => {
            const isSelected = data.interests.includes(option)
            const Icon = INTEREST_ICONS[option] || Sparkles

            return (
              <div
                key={option}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={disabled ? -1 : 0}
                onClick={() => toggleInterest(option)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    toggleInterest(option)
                  }
                }}
                className={cn(
                  'group relative flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30 shadow-xs font-semibold'
                    : 'border-border bg-background/60 hover:bg-background hover:border-primary/40 text-foreground/80'
                )}
              >
                {/* Visual Checkbox */}
                <Checkbox
                  checked={isSelected}
                  disabled={disabled}
                  aria-label={option}
                  className="pointer-events-none shrink-0"
                />

                {/* Option Icon */}
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isSelected ? 'text-primary' : 'text-muted group-hover:text-primary/70'
                  )}
                />

                {/* Option Label */}
                <span className="truncate leading-tight">{option}</span>
              </div>
            )
          })}
        </div>

        {/* Conditional Field: Other Interest Description */}
        {data.interests.includes('Other') && (
          <div className="pt-2 border-t border-border/60 space-y-1.5 animate-fade-in">
            <Label htmlFor="custom-interest" className="text-xs font-semibold text-foreground">
              Tell us about your interest <span className="text-primary">*</span>
            </Label>
            <Input
              id="custom-interest"
              type="text"
              placeholder="e.g., Robotics, Astronomy, Psychology, Game Development"
              value={data.customInterest}
              onChange={(e) => onChange({ customInterest: e.target.value })}
              disabled={disabled}
              aria-invalid={Boolean(errors.customInterest)}
              className={cn(
                'h-11 text-xs sm:text-sm bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
                errors.customInterest && 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive'
              )}
            />
            {errors.customInterest && (
              <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
                {errors.customInterest}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
