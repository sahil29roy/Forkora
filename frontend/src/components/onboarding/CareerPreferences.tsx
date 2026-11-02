import React, { useState } from 'react'
import { Briefcase, Building, Globe, ChevronDown, Target, X, Plus, Sparkles, Check } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  WORK_ENVIRONMENT_OPTIONS,
  CAREER_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  POPULAR_TARGET_CAREERS,
} from '@/config/interestCategories'
import type { AcademicInformationData } from '@/types/academicInformation.types'

interface CareerPreferencesProps {
  data: AcademicInformationData
  onChange: (updated: Partial<AcademicInformationData>) => void
  disabled?: boolean
}

export function CareerPreferences({
  data,
  onChange,
  disabled = false,
}: CareerPreferencesProps) {
  const [customCareerText, setCustomCareerText] = useState('')

  const preferredCareers = data.careerPreferences?.preferredCareers || []

  const updatePreference = (
    field: keyof AcademicInformationData['careerPreferences'],
    value: string
  ) => {
    onChange({
      careerPreferences: {
        ...data.careerPreferences,
        [field]: value,
      },
    })
  }

  const toggleCareer = (career: string) => {
    if (disabled) return
    const exists = preferredCareers.includes(career)
    if (exists) {
      onChange({
        careerPreferences: {
          ...data.careerPreferences,
          preferredCareers: preferredCareers.filter((c) => c !== career),
        },
      })
    } else {
      if (preferredCareers.length >= 3) return
      onChange({
        careerPreferences: {
          ...data.careerPreferences,
          preferredCareers: [...preferredCareers, career],
        },
      })
    }
  }

  const handleAddCustomCareer = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (disabled) return
    const trimmed = customCareerText.trim()
    if (!trimmed) return
    if (preferredCareers.length >= 3) return
    if (preferredCareers.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCustomCareerText('')
      return
    }
    onChange({
      careerPreferences: {
        ...data.careerPreferences,
        preferredCareers: [...preferredCareers, trimmed],
      },
    })
    setCustomCareerText('')
  }

  const handleRemoveCareer = (career: string) => {
    if (disabled) return
    onChange({
      careerPreferences: {
        ...data.careerPreferences,
        preferredCareers: preferredCareers.filter((c) => c !== career),
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
            Career Preferences & Target Aspirations <span className="text-xs sm:text-sm font-normal text-muted">(Optional)</span>
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Select up to 3 target careers and your preferred work style to personalize your recommendation scoring and pathways.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
        
        {/* SUBSECTION 1: Target Careers Selection */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <Label className="text-sm font-bold text-foreground">
                Target Career Choices
              </Label>
              <span className="text-xs text-muted">
                (Pick up to 3)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                Selected: {preferredCareers.length} / 3
              </span>
            </div>
          </div>

          {/* Selected Chips */}
          {preferredCareers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {preferredCareers.map((career, idx) => (
                <div
                  key={career}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-foreground text-xs font-semibold shadow-2xs transition-all animate-in fade-in"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span>{career}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCareer(career)}
                      className="ml-1 rounded-full p-0.5 text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label={`Remove ${career}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quick Selection Pills */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Popular pathways in Forkora graph:
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TARGET_CAREERS.map((career) => {
                const isSelected = preferredCareers.includes(career)
                const isMaxReached = preferredCareers.length >= 3 && !isSelected

                return (
                  <button
                    key={career}
                    type="button"
                    onClick={() => toggleCareer(career)}
                    disabled={disabled || isMaxReached}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : isMaxReached
                        ? 'bg-muted/20 border border-border/30 text-muted-foreground/40 cursor-not-allowed'
                        : 'bg-muted/30 border border-border/60 text-foreground hover:bg-muted/70 hover:border-border'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="h-3 w-3 stroke-[2.5]" />
                    ) : (
                      <Sparkles className="h-2.5 w-2.5 text-muted" />
                    )}
                    <span>{career}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Career Write-in Input */}
          {preferredCareers.length < 3 && !disabled && (
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                placeholder="Or type another career (e.g. Wildlife Biologist) and press Enter..."
                value={customCareerText}
                onChange={(e) => setCustomCareerText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomCareer()
                  }
                }}
                className="flex-1 h-9 px-3 rounded-lg border border-border text-xs bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => handleAddCustomCareer()}
                disabled={!customCareerText.trim()}
                className="h-9 px-3.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Career</span>
              </button>
            </div>
          )}
        </div>

        {/* SUBSECTION 2: Work Environment, Career Type, Preferred Location */}
        <div className="pt-2 border-t border-border/50">
          <Label className="text-sm font-bold text-foreground block mb-3">
            Work Environment & Setting
          </Label>

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

            {/* Field 3: Preferred Location */}
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
      </div>
    </section>
  )
}
