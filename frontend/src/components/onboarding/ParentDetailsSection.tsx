import { Users } from 'lucide-react'
import { ParentDetailsCard } from './ParentDetailsCard'
import type { FamilyDetails, OnboardingFormErrors } from '@/types/onboarding.types'

interface ParentDetailsSectionProps {
  familyDetails: FamilyDetails
  onChange: (updated: FamilyDetails) => void
  errors: OnboardingFormErrors
  disabled?: boolean
}

export function ParentDetailsSection({
  familyDetails,
  onChange,
  errors,
  disabled = false,
}: ParentDetailsSectionProps) {
  const updateParent1 = (field: 'name' | 'occupation', value: string) => {
    onChange({
      ...familyDetails,
      parent1: {
        ...familyDetails.parent1,
        [field]: value,
      },
    })
  }

  const updateParent2 = (field: 'name' | 'occupation', value: string) => {
    onChange({
      ...familyDetails,
      parent2: {
        ...familyDetails.parent2,
        [field]: value,
      },
    })
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Users className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Parent / Guardian Details
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Share basic information about your parents or guardians.
        </p>
      </div>

      {/* Side-by-side or stacked parent cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parent 1 Card */}
        <ParentDetailsCard
          idPrefix="parent-1"
          title="Parent / Guardian 1"
          nameValue={familyDetails.parent1.name}
          occupationValue={familyDetails.parent1.occupation}
          onNameChange={(val) => updateParent1('name', val)}
          onOccupationChange={(val) => updateParent1('occupation', val)}
          nameError={errors.parent1Name}
          disabled={disabled}
        />

        {/* Parent 2 Card */}
        <ParentDetailsCard
          idPrefix="parent-2"
          title="Parent / Guardian 2"
          nameValue={familyDetails.parent2.name}
          occupationValue={familyDetails.parent2.occupation}
          onNameChange={(val) => updateParent2('name', val)}
          onOccupationChange={(val) => updateParent2('occupation', val)}
          nameError={errors.parent2Name}
          disabled={disabled}
        />
      </div>
    </section>
  )
}
