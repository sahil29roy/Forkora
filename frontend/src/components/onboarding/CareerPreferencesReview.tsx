import { Pencil, Building2, Globe2, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReviewCareerPreferencesData } from '@/types/reviewOnboarding.types'

interface CareerPreferencesReviewProps {
  careerPreferences: ReviewCareerPreferencesData
  onEdit: () => void
}

export function CareerPreferencesReview({
  careerPreferences,
  onEdit,
}: CareerPreferencesReviewProps) {
  const workEnv = careerPreferences.workEnvironment?.trim()
  const careerType = careerPreferences.careerType?.trim()
  const location = careerPreferences.preferredLocation?.trim()

  const isWorkEnvSet = workEnv && workEnv !== 'No preference'
  const isCareerTypeSet = careerType && careerType !== 'No preference'
  const isLocationSet = location && location !== 'No preference'

  const hasAnyPreference = isWorkEnvSet || isCareerTypeSet || isLocationSet

  const fields = [
    {
      label: 'Work Environment',
      value: isWorkEnvSet ? workEnv : 'No preference',
      isSet: isWorkEnvSet,
      icon: Building2,
    },
    {
      label: 'Career Type',
      value: isCareerTypeSet ? careerType : 'No preference',
      isSet: isCareerTypeSet,
      icon: Briefcase,
    },
    {
      label: 'Preferred Location',
      value: isLocationSet ? location : 'No preference',
      isSet: isLocationSet,
      icon: Globe2,
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5 transition-colors">
      {/* Header with Title, Description, and Edit Button */}
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1 text-left">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Career Preferences <span className="text-muted-foreground font-normal text-xs sm:text-sm">(Optional)</span>
          </h3>
          <p className="text-xs sm:text-sm text-muted">
            Your general preferences for future opportunities.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-primary hover:text-primary/90 hover:bg-primary/10 gap-1.5 text-xs font-semibold rounded-lg shrink-0 h-8 px-2.5 sm:px-3"
          aria-label="Edit Career Preferences"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
      </div>

      {/* Preferences Display */}
      <div className="text-left">
        {!hasAnyPreference ? (
          <p className="text-xs sm:text-sm text-muted-foreground/70 italic font-normal">
            No career preferences selected.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {fields.map((field) => {
              const Icon = field.icon

              return (
                <div
                  key={field.label}
                  className="p-3 sm:p-3.5 rounded-xl border border-border/50 bg-muted/20 space-y-1"
                >
                  <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                    <Icon className="h-3 w-3 text-primary/70 shrink-0" />
                    {field.label}
                  </span>
                  <p
                    className={`text-xs sm:text-sm font-semibold break-words ${
                      !field.isSet
                        ? 'text-muted-foreground/70 italic font-normal'
                        : 'text-foreground'
                    }`}
                  >
                    {field.value}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
