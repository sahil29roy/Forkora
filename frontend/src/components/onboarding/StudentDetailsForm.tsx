import { User, GraduationCap, Phone, Mail, ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { StudentDetails, OnboardingFormErrors } from '@/types/onboarding.types'

interface StudentDetailsFormProps {
  studentDetails: StudentDetails
  onChange: (updated: StudentDetails) => void
  errors: OnboardingFormErrors
  disabled?: boolean
}

const CLASS_OPTIONS = [
  { value: 1, label: 'Class 1' },
  { value: 2, label: 'Class 2' },
  { value: 3, label: 'Class 3' },
  { value: 4, label: 'Class 4' },
  { value: 5, label: 'Class 5' },
  { value: 6, label: 'Class 6' },
  { value: 7, label: 'Class 7' },
  { value: 8, label: 'Class 8' },
  { value: 9, label: 'Class 9' },
  { value: 10, label: 'Class 10 (Secondary)' },
  { value: 11, label: 'Class 11 (Higher Secondary)' },
  { value: 12, label: 'Class 12 (Higher Secondary)' },
]

export function StudentDetailsForm({
  studentDetails,
  onChange,
  errors,
  disabled = false,
}: StudentDetailsFormProps) {
  const updateField = (field: keyof StudentDetails, value: any) => {
    onChange({
      ...studentDetails,
      [field]: value,
    })
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <User className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Student Details
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          Basic information about the student.
        </p>
      </div>

      {/* Inputs Container */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        {/* Field 1: Student Full Name (Full width) */}
        <div className="space-y-1.5">
          <Label htmlFor="student-full-name" className="text-xs font-semibold text-foreground">
            Student Full Name <span className="text-primary">*</span>
          </Label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted">
              <User className="h-4 w-4 stroke-[1.8]" />
            </div>
            <Input
              id="student-full-name"
              type="text"
              placeholder="Enter student's full name"
              value={studentDetails.studentName}
              onChange={(e) => updateField('studentName', e.target.value)}
              disabled={disabled}
              autoComplete="name"
              aria-invalid={Boolean(errors.studentName)}
              className={cn(
                'pl-10 h-11 text-xs sm:text-sm bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
                errors.studentName && 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive'
              )}
            />
          </div>
          {errors.studentName && (
            <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
              {errors.studentName}
            </p>
          )}
        </div>

        {/* 2-Column Responsive Row: Current Class + Phone Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Field 2: Current Class Dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="student-current-class" className="text-xs font-semibold text-foreground">
              Current Class <span className="text-primary">*</span>
            </Label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted z-10">
                <GraduationCap className="h-4 w-4 stroke-[1.8]" />
              </div>
              <select
                id="student-current-class"
                value={studentDetails.currentClass}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : ''
                  updateField('currentClass', val)
                }}
                disabled={disabled}
                aria-invalid={Boolean(errors.currentClass)}
                className={cn(
                  'w-full h-11 pl-10 pr-9 rounded-lg border text-xs sm:text-sm bg-background text-foreground transition-all duration-150 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50',
                  errors.currentClass ? 'border-destructive ring-destructive/20' : 'border-border',
                  !studentDetails.currentClass && 'text-muted-foreground'
                )}
              >
                <option value="" disabled className="bg-card text-muted">
                  Select your current class
                </option>
                {CLASS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-card text-foreground py-1">
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 flex items-center justify-center text-muted">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            {errors.currentClass && (
              <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
                {errors.currentClass}
              </p>
            )}
          </div>

          {/* Field 3: Phone Number (Optional, with country code support) */}
          <div className="space-y-1.5">
            <Label htmlFor="student-phone" className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Phone Number</span>
              <span className="text-[11px] font-normal text-muted">Optional</span>
            </Label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3 flex items-center justify-center text-muted">
                <Phone className="h-3.5 w-3.5 stroke-[1.8]" />
              </div>
              <Input
                id="student-phone"
                type="tel"
                placeholder="Enter phone number"
                value={studentDetails.phoneNumber}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
                disabled={disabled}
                autoComplete="tel"
                aria-invalid={Boolean(errors.phoneNumber)}
                className={cn(
                  'pl-9 h-11 text-xs sm:text-sm bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
                  errors.phoneNumber && 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive'
                )}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
                {errors.phoneNumber}
              </p>
            )}
          </div>
        </div>

        {/* Field 4: Contact Email (Full width, optional) */}
        <div className="space-y-1.5">
          <Label htmlFor="student-contact-email" className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Email Address</span>
            <span className="text-[11px] font-normal text-muted">Optional</span>
          </Label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted">
              <Mail className="h-4 w-4 stroke-[1.8]" />
            </div>
            <Input
              id="student-contact-email"
              type="email"
              placeholder="Enter email address"
              value={studentDetails.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              disabled={disabled}
              autoComplete="email"
              aria-invalid={Boolean(errors.contactEmail)}
              className={cn(
                'pl-10 h-11 text-xs sm:text-sm bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
                errors.contactEmail && 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive'
              )}
            />
          </div>
          <p className="text-[11px] text-muted">
            Secondary contact email. Kept separate from your authenticated login account.
          </p>
          {errors.contactEmail && (
            <p className="text-xs text-destructive font-medium mt-1 animate-fade-in">
              {errors.contactEmail}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
