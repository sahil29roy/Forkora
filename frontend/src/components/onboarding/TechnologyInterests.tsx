import { Code, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TECHNOLOGY_SUBCATEGORIES } from '@/config/interestCategories'

interface TechnologyInterestsProps {
  selectedTechInterests: string[]
  onChange: (updated: string[]) => void
  disabled?: boolean
}

export function TechnologyInterests({
  selectedTechInterests,
  onChange,
  disabled = false,
}: TechnologyInterestsProps) {
  const toggleSubcategory = (tech: string) => {
    if (disabled) return
    if (selectedTechInterests.includes(tech)) {
      onChange(selectedTechInterests.filter((t) => t !== tech))
    } else {
      onChange([...selectedTechInterests, tech])
    }
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-3.5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Code className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-foreground">
            Explore Technology Pathways (Any Stream)
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          <span>Available to all students</span>
        </span>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Select specific technical specializations you are curious about. Forkora will map prerequisites and alternative pathways even if you are not currently in a Pure Science stream.
      </p>

      {/* Subcategory Pills Grid */}
      <div className="flex flex-wrap gap-2">
        {TECHNOLOGY_SUBCATEGORIES.map((tech) => {
          const isSelected = selectedTechInterests.includes(tech)

          return (
            <button
              key={tech}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleSubcategory(tech)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border bg-card hover:border-primary/40 text-foreground'
              )}
            >
              {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
              <span>{tech}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
