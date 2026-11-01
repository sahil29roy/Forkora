import { useState, useMemo } from 'react'
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  Check,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { COMMON_SUBJECT_CATALOGUE } from '@/config/subjectCatalogue'
import type { SubjectItem, AcademicFormErrors } from '@/types/academicInformation.types'

interface DynamicSubjectSelectorProps {
  subjects: SubjectItem[]
  onAddSubject: (subjectName: string, category?: SubjectItem['subjectCategory']) => void
  onRemoveSubject: (subjectId: string) => void
  errors: AcademicFormErrors
  disabled?: boolean
}

export function DynamicSubjectSelector({
  subjects,
  onAddSubject,
  onRemoveSubject,
  errors,
  disabled = false,
}: DynamicSubjectSelectorProps) {
  const [isAddingOpen, setIsAddingOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customSubjectName, setCustomSubjectName] = useState('')
  const [addError, setAddError] = useState<string | null>(null)

  // Current subject names set (lowercased) to prevent duplicates
  const existingNamesLower = useMemo(() => {
    return new Set(subjects.map((s) => s.subjectName.trim().toLowerCase()))
  }, [subjects])

  // Filter catalogue based on search query
  const filteredCatalogue = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) {
      return COMMON_SUBJECT_CATALOGUE.slice(0, 16)
    }
    return COMMON_SUBJECT_CATALOGUE.filter((name) =>
      name.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const handleSelectFromCatalogue = (name: string) => {
    setAddError(null)
    if (existingNamesLower.has(name.toLowerCase())) {
      setAddError(`"${name}" is already in your subjects list.`)
      return
    }
    onAddSubject(name, 'ELECTIVE')
    setSearchQuery('')
    setIsAddingOpen(false)
  }

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setAddError(null)
    const trimmed = customSubjectName.trim()
    if (!trimmed) {
      setAddError('Please enter a subject name.')
      return
    }
    if (trimmed.length < 2) {
      setAddError('Subject name must be at least 2 characters.')
      return
    }
    if (existingNamesLower.has(trimmed.toLowerCase())) {
      setAddError(`"${trimmed}" is already in your subjects list.`)
      return
    }
    onAddSubject(trimmed, 'ADDITIONAL')
    setCustomSubjectName('')
    setIsAddingOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Section Sub-heading */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Your Subjects</span>
          </h4>
          <p className="text-xs text-muted">
            Review your subjects and make changes to match your actual academic combination.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsAddingOpen((prev) => !prev)
            setAddError(null)
          }}
          disabled={disabled}
          className="gap-1.5 text-xs font-semibold rounded-lg border-border hover:border-primary/40 text-foreground"
        >
          {isAddingOpen ? (
            <>
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5 text-primary" />
              <span>Add Subject</span>
            </>
          )}
        </Button>
      </div>

      {/* Expandable Add Subject Panel */}
      {isAddingOpen && (
        <div className="p-4 rounded-xl border border-primary/25 bg-background shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Choose from Catalogue or Add Custom Subject</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddingOpen(false)}
              className="text-muted hover:text-foreground text-xs"
            >
              Close
            </button>
          </div>

          {/* Search Catalogue Input */}
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-muted">
              <Search className="h-3.5 w-3.5" />
            </div>
            <Input
              type="text"
              placeholder="Search subject catalogue (e.g., Computer Science, Economics, Psychology)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-card border-border"
            />
          </div>

          {/* Catalogue Suggestions Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-muted">Suggested Subjects:</span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {filteredCatalogue.map((name) => {
                const isAlreadyAdded = existingNamesLower.has(name.toLowerCase())
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSelectFromCatalogue(name)}
                    disabled={isAlreadyAdded || disabled}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium border transition-all text-left flex items-center gap-1.5',
                      isAlreadyAdded
                        ? 'border-border/40 bg-muted-bg/50 text-muted cursor-not-allowed opacity-60'
                        : 'border-border bg-card hover:bg-primary/10 hover:border-primary/40 text-foreground cursor-pointer'
                    )}
                  >
                    <span>{name}</span>
                    {isAlreadyAdded && <Check className="h-3 w-3 text-success shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Subject Name Row */}
          <form onSubmit={handleAddCustom} className="pt-2 border-t border-border/60 flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Can't find your subject? Enter custom name (e.g. Robotics, Painting)"
                value={customSubjectName}
                onChange={(e) => setCustomSubjectName(e.target.value)}
                className="h-9 text-xs bg-card border-border"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!customSubjectName.trim() || disabled}
              className="h-9 px-3 text-xs font-semibold bg-primary text-primary-foreground"
            >
              Add Custom
            </Button>
          </form>

          {/* Error Message for Add */}
          {addError && (
            <div className="flex items-center gap-1.5 text-xs text-destructive font-medium animate-fade-in">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{addError}</span>
            </div>
          )}
        </div>
      )}

      {/* Active Subjects Pills / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {subjects.map((sub) => {
          const isRemovable = !sub.isRequired || sub.isCustom

          return (
            <div
              key={sub.id}
              className={cn(
                'flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs',
                sub.isRequired
                  ? 'border-border bg-card/90 shadow-2xs'
                  : 'border-dashed border-border bg-background/60 hover:bg-card'
              )}
            >
              <div className="min-w-0 pr-2">
                <div className="font-semibold text-foreground truncate flex items-center gap-1">
                  <span>{sub.subjectName}</span>
                  {sub.isRequired && <span className="text-primary">*</span>}
                </div>
                <div className="text-[10px] text-muted flex items-center gap-1.5 mt-0.5">
                  <span className="uppercase tracking-wider font-bold text-[9px] text-primary/80">
                    {sub.subjectCategory}
                  </span>
                  <span>•</span>
                  <span>{sub.isRequired ? 'Required' : 'Optional'}</span>
                </div>
              </div>

              {isRemovable && (
                <button
                  type="button"
                  onClick={() => onRemoveSubject(sub.id)}
                  disabled={disabled}
                  title={`Remove ${sub.subjectName}`}
                  aria-label={`Remove ${sub.subjectName}`}
                  className="p-1 rounded-md text-muted hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {errors.general && (
        <p className="text-xs text-destructive font-medium animate-fade-in">
          {errors.general}
        </p>
      )}
    </div>
  )
}
