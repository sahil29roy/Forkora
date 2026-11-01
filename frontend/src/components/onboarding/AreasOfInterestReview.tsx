import { Pencil, Compass, Sparkles, Cpu, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getStreamPreferenceLabel } from '@/config/interestCategories'
import type { ReviewInterestsData } from '@/types/reviewOnboarding.types'

interface AreasOfInterestReviewProps {
  interests: ReviewInterestsData
  onEdit: () => void
  currentClass?: number
}

export function AreasOfInterestReview({ interests, onEdit, currentClass }: AreasOfInterestReviewProps) {
  const isClass10 = currentClass !== undefined && currentClass <= 10
  const selected = interests.selectedInterests || []
  const customList = interests.customInterests || []
  const techList = interests.technologyInterests || []

  const hasAnyInterest =
    selected.length > 0 || (!isClass10 && (customList.length > 0 || techList.length > 0))

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5 transition-colors">
      {/* Header with Title, Description, and Edit Button */}
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1 text-left">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            {isClass10 ? 'Academic Stream Preferences' : 'Areas of Interest'}
          </h3>
          <p className="text-xs sm:text-sm text-muted">
            {isClass10
              ? 'Academic streams and subject combinations you want to explore after Class 10.'
              : 'Fields you enjoy or are curious about.'}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-primary hover:text-primary/90 hover:bg-primary/10 gap-1.5 text-xs font-semibold rounded-lg shrink-0 h-8 px-2.5 sm:px-3"
          aria-label={isClass10 ? 'Edit Academic Stream Preferences' : 'Edit Areas of Interest'}
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
      </div>

      {/* Badges / Chips Display */}
      <div className="text-left space-y-4">
        {!hasAnyInterest ? (
          <p className="text-xs sm:text-sm text-muted-foreground/70 italic font-normal">
            {isClass10
              ? 'No academic stream preferences selected.'
              : 'No interests specified.'}
          </p>
        ) : (
          <div className="space-y-3.5">
            {/* Primary Selected Stream Preferences or Interests */}
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                {selected.map((item) => {
                  const label = isClass10 ? getStreamPreferenceLabel(item) : item
                  return (
                    <Badge
                      key={item}
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/25 hover:bg-primary/15 font-semibold text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 transition-colors"
                    >
                      {isClass10 ? (
                        <Layers className="h-3 w-3 stroke-[2.5]" />
                      ) : (
                        <Compass className="h-3 w-3 stroke-[2.5]" />
                      )}
                      <span>{label}</span>
                    </Badge>
                  )
                })}

                {!isClass10 &&
                  customList.map((custom, idx) => (
                    <Badge
                      key={`custom-${idx}`}
                      variant="outline"
                      className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25 font-semibold text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{custom}</span>
                    </Badge>
                  ))}
              </div>
            )}

            {/* Detailed Technology Subcategories if selected (Class 11/12 only) */}
            {!isClass10 && techList.length > 0 && (
              <div className="pt-2 border-t border-border/40 space-y-2">
                <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-primary/70 shrink-0" />
                  Specialized Tech Subcategories
                </span>
                <div className="flex flex-wrap gap-2 items-center">
                  {techList.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="bg-muted/80 text-foreground border border-border/60 text-xs py-1 px-2.5 rounded-lg font-medium"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
