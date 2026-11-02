import { Pencil, Building2, Globe2, Briefcase, Target, Sparkles } from 'lucide-react'
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
  const preferredCareers = careerPreferences.preferredCareers || []
  const workEnv = careerPreferences.workEnvironment?.trim()
  const careerType = careerPreferences.careerType?.trim()
  const location = careerPreferences.preferredLocation?.trim()

  const isWorkEnvSet = workEnv && workEnv !== 'No preference'
  const isCareerTypeSet = careerType && careerType !== 'No preference'
  const isLocationSet = location && location !== 'No preference'

  const hasAnyPreference =
    preferredCareers.length > 0 || isWorkEnvSet || isCareerTypeSet || isLocationSet

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
            Career Preferences & Target Aspirations <span className="text-muted-foreground font-normal text-xs sm:text-sm">(Optional)</span>
          </h3>
          <p className="text-xs sm:text-sm text-muted">
            Your target career choices and general work preferences for personalized guidance.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-primary hover:text-primary/90 hover:bg-primary/10 gap-1.5 text-xs font-semibold rounded-lg shrink-0 h-8 px-2.5 sm:px-3 cursor-pointer"
          aria-label="Edit Career Preferences"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
      </div>

      {/* Target Careers Section */}
      <div className="space-y-2 text-left">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" />
          Target Career Choices (Up to 3)
        </span>

        {preferredCareers.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {preferredCareers.map((career, idx) => (
              <span
                key={career}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-foreground text-xs font-semibold"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span>{career}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/70 italic flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-muted" />
            No specific careers chosen. Forkora will recommend pathways across all domains based on your assessments.
          </p>
        )}
      </div>

      {/* Preferences Display */}
      <div className="text-left pt-2 border-t border-border/40">
        {!hasAnyPreference && preferredCareers.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground/70 italic font-normal">
            No work environment preferences selected.
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
