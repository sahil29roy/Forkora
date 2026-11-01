import { Pencil, User, Phone, Mail, GraduationCap, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReviewStudentData } from '@/types/reviewOnboarding.types'

interface StudentDetailsReviewProps {
  student: ReviewStudentData
  onEdit: () => void
}

export function StudentDetailsReview({ student, onEdit }: StudentDetailsReviewProps) {
  // Map study status
  const formatStudyStatus = (status: string) => {
    if (!status) return 'Not provided'
    if (status.toUpperCase() === 'CURRENTLY_STUDYING') return 'Currently Studying'
    if (status.toUpperCase() === 'PASSED') return 'Passed'
    return status
  }

  const fields = [
    {
      label: 'Full Name',
      value: student.studentName || 'Not provided',
      icon: User,
    },
    {
      label: 'Current Class',
      value: student.currentClass ? `Class ${student.currentClass}` : 'Not provided',
      icon: GraduationCap,
    },
    {
      label: 'Study Status',
      value: formatStudyStatus(student.studyStatus),
      icon: Clock,
    },
    {
      label: 'Passing / Expected Year',
      value: student.passingYear ? String(student.passingYear) : 'Not provided',
      icon: Calendar,
    },
    {
      label: 'Phone Number',
      value: student.phoneNumber?.trim() ? student.phoneNumber : 'Not provided',
      icon: Phone,
    },
    {
      label: 'Contact Email',
      value: student.contactEmail?.trim() ? student.contactEmail : 'Not provided',
      icon: Mail,
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5 transition-colors">
      {/* Header with Title, Description, and Edit Button */}
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Student Details
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            Your basic information and current academic stage.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-primary hover:text-primary/90 hover:bg-primary/10 gap-1.5 text-xs font-semibold rounded-lg shrink-0 h-8 px-2.5 sm:px-3"
          aria-label="Edit Student Details"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
      </div>

      {/* 2-column or 3-column field grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 text-left">
        {fields.map((field) => {
          const Icon = field.icon
          const isNotProvided = field.value === 'Not provided'

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
                  isNotProvided ? 'text-muted-foreground/70 italic font-normal' : 'text-foreground'
                }`}
              >
                {field.value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
