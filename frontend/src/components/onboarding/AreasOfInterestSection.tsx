import {
  Compass,
  Sparkles,
  Atom,
  Dna,
  TrendingUp,
  Briefcase,
  Palette,
  Wrench,
  HelpCircle,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { CLASS_10_STREAM_PREFERENCES } from '@/config/interestCategories'
import type { Class10AcademicData, Class10FormErrors } from '@/types/academicOnboarding.types'

interface AreasOfInterestSectionProps {
  data: Class10AcademicData
  onChange: (updated: Partial<Class10AcademicData>) => void
  errors: Class10FormErrors
  disabled?: boolean
}

const STREAM_PREFERENCE_ICONS: Record<string, React.ElementType> = {
  SCIENCE_PCM: Atom,
  SCIENCE_PCB: Dna,
  SCIENCE_PCMB: Sparkles,
  COMMERCE_WITH_MATH: TrendingUp,
  COMMERCE_WITHOUT_MATH: Briefcase,
  ARTS_HUMANITIES: Palette,
  VOCATIONAL: Wrench,
  OTHER_UNDECIDED: HelpCircle,
}

export function AreasOfInterestSection({
  data,
  onChange,
  disabled = false,
}: AreasOfInterestSectionProps) {
  const toggleStreamPreference = (preferenceId: string) => {
    if (disabled) return
    const isSelected =
      data.interests.includes(preferenceId) ||
      (preferenceId === 'SCIENCE_PCM' && data.interests.includes('Science – PCM')) ||
      (preferenceId === 'SCIENCE_PCB' && data.interests.includes('Science – PCB')) ||
      (preferenceId === 'SCIENCE_PCMB' && data.interests.includes('Science – PCMB')) ||
      (preferenceId === 'COMMERCE_WITH_MATH' && data.interests.includes('Commerce with Mathematics')) ||
      (preferenceId === 'COMMERCE_WITHOUT_MATH' && data.interests.includes('Commerce without Mathematics')) ||
      (preferenceId === 'ARTS_HUMANITIES' && data.interests.includes('Arts / Humanities')) ||
      (preferenceId === 'VOCATIONAL' && data.interests.includes('Vocational Education')) ||
      (preferenceId === 'OTHER_UNDECIDED' && data.interests.includes('Other / Undecided'))

    let newInterests: string[]
    if (isSelected) {
      newInterests = data.interests.filter(
        (i) =>
          i !== preferenceId &&
          i !== 'Science – PCM' &&
          i !== 'Science – PCB' &&
          i !== 'Science – PCMB' &&
          i !== 'Commerce with Mathematics' &&
          i !== 'Commerce without Mathematics' &&
          i !== 'Arts / Humanities' &&
          i !== 'Vocational Education' &&
          i !== 'Other / Undecided'
      )
    } else {
      newInterests = [...data.interests, preferenceId]
    }

    onChange({
      interests: newInterests,
      customInterest: '',
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
            Explore Your Academic Interests
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Choose the academic streams or subject combinations you may want to pursue after Class 10. You can explore multiple pathways before making your decision.
        </p>
      </div>

      {/* Multi-Select Grid Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          {CLASS_10_STREAM_PREFERENCES.map((option) => {
            const isSelected =
              data.interests.includes(option.id) || data.interests.includes(option.label)
            const Icon = STREAM_PREFERENCE_ICONS[option.id] || Sparkles

            return (
              <div
                key={option.id}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={disabled ? -1 : 0}
                onClick={() => toggleStreamPreference(option.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    toggleStreamPreference(option.id)
                  }
                }}
                className={cn(
                  'group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  isSelected
                    ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30 shadow-xs'
                    : 'border-border bg-background/60 hover:bg-background hover:border-primary/40 text-foreground/80'
                )}
              >
                {/* Visual Checkbox */}
                <Checkbox
                  checked={isSelected}
                  disabled={disabled}
                  aria-label={option.label}
                  className="mt-0.5 pointer-events-none shrink-0"
                />

                {/* Option Icon */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isSelected
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div
                    className={cn(
                      'text-xs sm:text-sm font-semibold leading-tight tracking-tight',
                      isSelected ? 'text-foreground font-bold' : 'text-foreground/90'
                    )}
                  >
                    {option.label}
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {option.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
