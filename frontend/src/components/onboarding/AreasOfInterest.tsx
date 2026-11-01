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
  Atom,
  Dna,
  Briefcase,
  Wrench,
  HelpCircle,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { BROAD_INTEREST_OPTIONS, CLASS_10_STREAM_PREFERENCES } from '@/config/interestCategories'
import { TechnologyInterests } from './TechnologyInterests'
import type { AcademicInformationData, AcademicFormErrors } from '@/types/academicInformation.types'

interface AreasOfInterestProps {
  data: AcademicInformationData
  onChange: (updated: Partial<AcademicInformationData>) => void
  errors: AcademicFormErrors
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

export function AreasOfInterest({
  data,
  onChange,
  errors,
  disabled = false,
}: AreasOfInterestProps) {
  const isClass10 = data.currentClass <= 10

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
      technologyInterests: newInterests.includes('Technology & Computers')
        ? data.technologyInterests
        : [],
    })
  }

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
      technologyInterests: [],
    })
  }

  const handleTechChange = (updatedTech: string[]) => {
    onChange({ technologyInterests: updatedTech })
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
            {isClass10 ? 'Explore Your Academic Interests' : 'Areas of Interest'}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          {isClass10
            ? 'Choose the academic streams or subject combinations you may want to pursue after Class 10. You can explore multiple pathways before making your decision.'
            : 'Select the areas you enjoy or are curious about. You can choose multiple options.'}
        </p>
      </div>

      {/* Multi-Select Grid Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
        {isClass10 ? (
          /* Class 10 Academic Stream Preferences Grid */
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
        ) : (
          /* Class 11 and 12 Broad Interests Grid */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
              {BROAD_INTEREST_OPTIONS.map((option) => {
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
                    errors.customInterest &&
                      'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive'
                  )}
                />
                {errors.customInterest && (
                  <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
                    {errors.customInterest}
                  </p>
                )}
              </div>
            )}

            {/* Detailed Technology Subcategories */}
            {data.interests.includes('Technology & Computers') && (
              <TechnologyInterests
                selectedTechInterests={data.technologyInterests}
                onChange={handleTechChange}
                disabled={disabled}
              />
            )}
          </>
        )}
      </div>
    </section>
  )
}
