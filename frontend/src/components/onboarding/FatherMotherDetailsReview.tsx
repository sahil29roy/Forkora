import { Pencil, Users, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReviewFamilyData } from '@/types/reviewOnboarding.types'

interface FatherMotherDetailsReviewProps {
  family: ReviewFamilyData
  onEdit: () => void
}

export function FatherMotherDetailsReview({ family, onEdit }: FatherMotherDetailsReviewProps) {
  const fatherName = family.fatherName?.trim() || 'Not provided'
  const fatherOccupation = family.fatherOccupation?.trim() || 'Not provided'

  const motherName = family.motherName?.trim() || 'Not provided'
  const motherOccupation = family.motherOccupation?.trim() || 'Not provided'

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5 transition-colors">
      {/* Header with Title, Description, and Edit Button */}
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1 text-left">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Father & Mother Details
          </h3>
          <p className="text-xs sm:text-sm text-muted">
            Parent and guardian details provided during onboarding.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-primary hover:text-primary/90 hover:bg-primary/10 gap-1.5 text-xs font-semibold rounded-lg shrink-0 h-8 px-2.5 sm:px-3"
          aria-label="Edit Father and Mother Details"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
      </div>

      {/* Two-Column Side-by-Side: Father Details vs Mother Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
        {/* Father Details */}
        <div className="p-4 sm:p-5 rounded-xl border border-border/60 bg-muted/20 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Father Details</h4>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Father's Name
              </span>
              <p
                className={`text-xs sm:text-sm font-semibold break-words ${
                  fatherName === 'Not provided'
                    ? 'text-muted-foreground/70 italic font-normal'
                    : 'text-foreground'
                }`}
              >
                {fatherName}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                <Briefcase className="h-3 w-3 text-muted-foreground/70" />
                Occupation
              </span>
              <p
                className={`text-xs sm:text-sm font-semibold break-words ${
                  fatherOccupation === 'Not provided'
                    ? 'text-muted-foreground/70 italic font-normal'
                    : 'text-foreground'
                }`}
              >
                {fatherOccupation}
              </p>
            </div>
          </div>
        </div>

        {/* Mother Details */}
        <div className="p-4 sm:p-5 rounded-xl border border-border/60 bg-muted/20 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Mother Details</h4>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Mother's Name
              </span>
              <p
                className={`text-xs sm:text-sm font-semibold break-words ${
                  motherName === 'Not provided'
                    ? 'text-muted-foreground/70 italic font-normal'
                    : 'text-foreground'
                }`}
              >
                {motherName}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                <Briefcase className="h-3 w-3 text-muted-foreground/70" />
                Occupation
              </span>
              <p
                className={`text-xs sm:text-sm font-semibold break-words ${
                  motherOccupation === 'Not provided'
                    ? 'text-muted-foreground/70 italic font-normal'
                    : 'text-foreground'
                }`}
              >
                {motherOccupation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
