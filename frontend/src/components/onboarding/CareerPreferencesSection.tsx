import { Briefcase, Building, Globe, ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  WORK_ENVIRONMENT_OPTIONS,
  CAREER_TYPE_OPTIONS,
  LOCATION_OPTIONS,
} from '@/validators/class10Academic.schema'
import type { Class10AcademicData } from '@/types/academicOnboarding.types'

interface CareerPreferencesSectionProps {
  data: Class10AcademicData
  onChange: (updated: Partial<Class10AcademicData>) => void
  disabled?: boolean
}

export function CareerPreferencesSection({
  data,
  onChange,
  disabled = false,
}: CareerPreferencesSectionProps) {
  const updatePreference = (field: keyof Class10AcademicData['careerPreferences'], value: string) => {
    onChange({
      careerPreferences: {
        ...data.careerPreferences,
        [field]: value,
      },
    })
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Briefcase className="h-4 w-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Career Preferences (Optional)
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Help us personalize your recommendations.
        </p>
      </div>

      {/* Inputs Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Field 1: Preferred Work Environment */}
          <div className="space-y-1.5">
            <Label htmlFor="pref-work-env" className="text-xs font-semibold text-foreground">
              Work Environment
            </Label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted z-10">
                <Building className="h-4 w-4 stroke-[1.8]" />
              </div>
              <select
                id="pref-work-env"
                value={data.careerPreferences.workEnvironment}
                onChange={(e) => updatePreference('workEnvironment', e.target.value)}
                disabled={disabled}
                className="w-full h-11 pl-10 pr-9 rounded-lg border border-border text-xs sm:text-sm bg-background text-foreground transition-all duration-150 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled className="bg-card text-muted">
                  Select preference
                </option>
                {WORK_ENVIRONMENT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-card text-foreground py-1">
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 flex items-center justify-center text-muted">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Field 2: Preferred Career Type */}
          <div className="space-y-1.5">
            <Label htmlFor="pref-career-type" className="text-xs font-semibold text-foreground">
              Career Type
            </Label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted z-10">
                <Briefcase className="h-4 w-4 stroke-[1.8]" />
              </div>
              <select
                id="pref-career-type"
                value={data.careerPreferences.careerType}
                onChange={(e) => updatePreference('careerType', e.target.value)}
                disabled={disabled}
                className="w-full h-11 pl-10 pr-9 rounded-lg border border-border text-xs sm:text-sm bg-background text-foreground transition-all duration-150 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled className="bg-card text-muted">
                  Select preference
                </option>
                {CAREER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-card text-foreground py-1">
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 flex items-center justify-center text-muted">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Field 3: Preferred Location (Future) */}
          <div className="space-y-1.5">
            <Label htmlFor="pref-location" className="text-xs font-semibold text-foreground">
              Preferred Location
            </Label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted z-10">
                <Globe className="h-4 w-4 stroke-[1.8]" />
              </div>
              <select
                id="pref-location"
                value={data.careerPreferences.preferredLocation}
                onChange={(e) => updatePreference('preferredLocation', e.target.value)}
                disabled={disabled}
                className="w-full h-11 pl-10 pr-9 rounded-lg border border-border text-xs sm:text-sm bg-background text-foreground transition-all duration-150 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled className="bg-card text-muted">
                  Select preference
                </option>
                {LOCATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-card text-foreground py-1">
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 flex items-center justify-center text-muted">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
