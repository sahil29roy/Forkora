import { Compass, BrainCircuit, BookOpen, Briefcase } from 'lucide-react'
import { AssessmentModuleCard } from './AssessmentModuleCard'
import type { AssessmentModule } from '@/types/assessment.types'

interface AssessmentModulesGridProps {
  modules?: AssessmentModule[]
  onSelectModule?: (module: AssessmentModule) => void
}

// Default structural template for the 4 core assessment modules
const DEFAULT_MODULES: AssessmentModule[] = [
  {
    id: 'interest-discovery',
    title: 'Interest Discovery',
    description:
      'Explore the subjects, activities, and professional domains that genuinely interest you.',
    icon: Compass,
  },
  {
    id: 'aptitude-assessment',
    title: 'Aptitude Assessment',
    description:
      'Understand your problem-solving approach, analytical thinking, and areas of aptitude.',
    icon: BrainCircuit,
  },
  {
    id: 'learning-preferences',
    title: 'Learning Preferences',
    description:
      'Discover how you prefer to learn, understand concepts, and develop new skills.',
    icon: BookOpen,
  },
  {
    id: 'work-style-motivation',
    title: 'Work Style & Motivation',
    description:
      'Explore your work preferences, personal values, motivation, and preferred working environment.',
    icon: Briefcase,
  },
]

export function AssessmentModulesGrid({
  modules = DEFAULT_MODULES,
  onSelectModule,
}: AssessmentModulesGridProps) {
  return (
    <section id="assessment-modules-section" className="space-y-4 text-left">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Your Assessment Modules
        </h2>
        <p className="text-xs sm:text-sm text-muted">
          Each module focuses on a different aspect of your personal and career profile. You can complete them individually.
        </p>
      </div>

      {/* 2x2 Grid of Module Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {modules.map((mod) => (
          <AssessmentModuleCard
            key={mod.id}
            module={mod}
            onSelect={onSelectModule}
          />
        ))}
      </div>
    </section>
  )
}
