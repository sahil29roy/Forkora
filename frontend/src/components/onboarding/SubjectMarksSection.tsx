import React from 'react'
import { BookOpen, Plus, Trash2, HelpCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SubjectMarkItem, Class10FormErrors } from '@/types/academicOnboarding.types'

interface SubjectMarksSectionProps {
  subjects: SubjectMarkItem[]
  onChange: (updatedSubjects: SubjectMarkItem[]) => void
  errors: Class10FormErrors
  disabled?: boolean
}

export function SubjectMarksSection({
  subjects,
  onChange,
  errors,
  disabled = false,
}: SubjectMarksSectionProps) {
  const subjectErrors = errors.subjects || {}

  const handleMarkChange = (id: string, val: string) => {
    // Sanitize numeric input
    if (val === '') {
      onChange(
        subjects.map((sub) => (sub.id === id ? { ...sub, marksObtained: '' } : sub))
      )
      return
    }

    const num = Number(val)
    if (Number.isNaN(num)) return

    // Cap between 0 and 100
    const clamped = Math.min(100, Math.max(0, num))

    onChange(
      subjects.map((sub) => (sub.id === id ? { ...sub, marksObtained: clamped } : sub))
    )
  }

  const handleNameChange = (id: string, newName: string) => {
    onChange(
      subjects.map((sub) => (sub.id === id ? { ...sub, subjectName: newName } : sub))
    )
  }

  const handleAddSubject = () => {
    const newId = `custom_subject_${Date.now()}`
    const newSubject: SubjectMarkItem = {
      id: newId,
      subjectName: '',
      marksObtained: '',
      maximumMarks: 100,
      isRequired: false,
      category: 'ADDITIONAL',
      isCustomName: true,
    }
    onChange([...subjects, newSubject])
  }

  const handleRemoveSubject = (id: string) => {
    onChange(subjects.filter((sub) => sub.id !== id))
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Subject Marks
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Enter your Class 10th subject marks (out of 100).
        </p>
      </div>

      {/* Main Subjects Card */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {subjects.map((subject, index) => {
            const hasError = Boolean(subjectErrors[subject.id])
            const isOptional = !subject.isRequired

            return (
              <div
                key={subject.id}
                className={cn(
                  'p-3.5 sm:p-4 rounded-xl border transition-all duration-150',
                  hasError
                    ? 'border-destructive/60 bg-destructive/5'
                    : 'border-border/80 bg-background/50 hover:bg-background/80 hover:border-primary/30'
                )}
              >
                {/* Subject Label Row */}
                <div className="flex items-center justify-between pb-2">
                  {subject.isCustomName ? (
                    <div className="w-full mr-2">
                      <Label
                        htmlFor={`subject-name-${subject.id}`}
                        className="text-[11px] font-semibold text-muted block pb-1"
                      >
                        Subject Name {isOptional ? '(Optional)' : <span className="text-primary">*</span>}
                      </Label>
                      <Input
                        id={`subject-name-${subject.id}`}
                        type="text"
                        placeholder="e.g., Computer Applications, Hindi"
                        value={subject.subjectName}
                        onChange={(e) => handleNameChange(subject.id, e.target.value)}
                        disabled={disabled}
                        className="h-8 text-xs bg-card border-border"
                      />
                    </div>
                  ) : (
                    <Label
                      htmlFor={`subject-marks-${subject.id}`}
                      className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5"
                    >
                      <span>{subject.subjectName}</span>
                      {subject.isRequired ? (
                        <span className="text-primary">*</span>
                      ) : (
                        <span className="text-[11px] font-normal text-muted">(Optional)</span>
                      )}
                    </Label>
                  )}

                  {/* Remove Button for user-added subjects */}
                  {index >= 5 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subject.id)}
                      disabled={disabled}
                      title="Remove this subject"
                      className="text-muted hover:text-destructive p-1 rounded-md transition-colors"
                      aria-label={`Remove ${subject.subjectName || 'subject'}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Numeric Marks Input Container with /100 suffix */}
                <div className="relative flex items-center">
                  <Input
                    id={`subject-marks-${subject.id}`}
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Enter marks"
                    value={subject.marksObtained}
                    onChange={(e) => handleMarkChange(subject.id, e.target.value)}
                    onKeyDown={(e) => {
                      // Prevent exponent, minus or plus characters
                      if (['e', 'E', '+', '-'].includes(e.key)) {
                        e.preventDefault()
                      }
                    }}
                    disabled={disabled}
                    aria-invalid={hasError}
                    className={cn(
                      'h-11 pr-14 text-sm font-semibold bg-card border-border tracking-tight focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
                      hasError && 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive'
                    )}
                  />
                  {/* Fixed / 100 indicator */}
                  <div className="pointer-events-none absolute right-3 flex items-center text-xs font-semibold text-muted bg-muted-bg px-2 py-0.5 rounded border border-border/50">
                    / 100
                  </div>
                </div>

                {/* Inline Error Message */}
                {hasError && (
                  <p className="text-[11px] text-destructive font-medium mt-1.5 animate-fade-in">
                    {subjectErrors[subject.id]}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Add Additional Subject Action */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSubject}
            disabled={disabled}
            className="gap-2 text-xs font-semibold border-dashed border-border hover:border-primary/50 text-foreground w-full sm:w-auto"
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            <span>Add Additional Subject</span>
          </Button>

          <p className="text-[11px] text-muted flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 shrink-0" />
            <span>You can add regional languages or vocational subjects if applicable.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
