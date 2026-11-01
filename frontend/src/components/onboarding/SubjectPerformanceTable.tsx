import { Badge } from '@/components/ui/badge'
import type { ReviewSubjectRecord } from '@/types/reviewOnboarding.types'

interface SubjectPerformanceTableProps {
  subjects: ReviewSubjectRecord[]
}

export function SubjectPerformanceTable({ subjects }: SubjectPerformanceTableProps) {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border bg-muted/10 text-center text-xs text-muted-foreground">
        No subjects selected or recorded.
      </div>
    )
  }

  // Calculate percentage safely
  const calculatePercentage = (
    marksObtained: number | string | null | undefined,
    maximumMarks: number | null | undefined
  ): { text: string; isProvided: boolean } => {
    if (
      marksObtained === '' ||
      marksObtained === null ||
      marksObtained === undefined ||
      Number.isNaN(Number(marksObtained))
    ) {
      return { text: 'Not provided', isProvided: false }
    }

    const marksNum = Number(marksObtained)
    const maxNum = Number(maximumMarks) || 100

    if (maxNum <= 0) return { text: 'Not provided', isProvided: false }

    const pct = (marksNum / maxNum) * 100
    // If it's a whole number, show without decimal, otherwise show 1 decimal place
    const formatted = Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`
    return { text: formatted, isProvided: true }
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 font-semibold text-muted-foreground">
              <th scope="col" className="py-3 px-3.5 sm:px-4 text-left">
                Subject
              </th>
              <th scope="col" className="py-3 px-3.5 sm:px-4 text-right">
                Marks Obtained
              </th>
              <th scope="col" className="py-3 px-3.5 sm:px-4 text-right">
                Maximum Marks
              </th>
              <th scope="col" className="py-3 px-3.5 sm:px-4 text-right">
                Percentage / Grade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-foreground">
            {subjects.map((sub, idx) => {
              const hasMarks =
                sub.marksObtained !== '' &&
                sub.marksObtained !== null &&
                sub.marksObtained !== undefined &&
                !Number.isNaN(Number(sub.marksObtained))

              const { text: pctText, isProvided } = calculatePercentage(
                sub.marksObtained,
                sub.maximumMarks
              )

              return (
                <tr
                  key={sub.id || `${sub.subjectName}-${idx}`}
                  className="hover:bg-muted/20 transition-colors"
                >
                  {/* Subject Name and Category */}
                  <td className="py-3 px-3.5 sm:px-4 font-medium text-foreground">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{sub.subjectName}</span>
                      {sub.isCustom && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 px-1.5 h-4 bg-muted text-muted-foreground"
                        >
                          Custom
                        </Badge>
                      )}
                      {sub.subjectCategory && sub.subjectCategory !== 'CORE' && (
                        <span className="text-[10px] font-normal text-muted-foreground">
                          ({sub.subjectCategory.toLowerCase()})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Marks Obtained */}
                  <td className="py-3 px-3.5 sm:px-4 text-right font-medium">
                    {hasMarks ? (
                      <span className="text-foreground">{sub.marksObtained}</span>
                    ) : (
                      <span className="text-muted-foreground/70 italic font-normal text-xs">
                        Not provided
                      </span>
                    )}
                  </td>

                  {/* Maximum Marks */}
                  <td className="py-3 px-3.5 sm:px-4 text-right text-muted-foreground">
                    {sub.maximumMarks ? sub.maximumMarks : '100'}
                  </td>

                  {/* Percentage or Grade */}
                  <td className="py-3 px-3.5 sm:px-4 text-right">
                    {sub.grade ? (
                      <Badge
                        variant="outline"
                        className="font-bold text-primary border-primary/30 bg-primary/5 text-xs"
                      >
                        {sub.grade}
                      </Badge>
                    ) : isProvided ? (
                      <span className="font-semibold text-primary">{pctText}</span>
                    ) : (
                      <span className="text-muted-foreground/70 italic font-normal text-xs">
                        Not provided
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
