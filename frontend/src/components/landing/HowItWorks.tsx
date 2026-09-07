import { GraduationCap, ClipboardCheck, GitBranch, Waypoints, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Understand',
      icon: GraduationCap,
      description: 'Tell Forkora where you are academically and what you are interested in.',
      badgeText: 'Academic Baseline',
      iconBg: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      step: '02',
      title: 'Assess',
      icon: ClipboardCheck,
      description: 'Understand your interests, preferences, and strengths through a structured assessment.',
      badgeText: 'Psychometric Profile',
      iconBg: 'bg-accent/15 text-accent dark:text-accent-foreground border-accent/20',
    },
    {
      step: '03',
      title: 'Explore',
      icon: GitBranch,
      description: 'Explore multiple academic and career pathways from your current position.',
      badgeText: 'Graph Traversal',
      iconBg: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      step: '04',
      title: 'Simulate',
      icon: Waypoints,
      description: 'See how choices affect future possibilities, switching costs, and alternative routes.',
      badgeText: 'What-If Modeling',
      iconBg: 'bg-accent/15 text-accent dark:text-accent-foreground border-accent/20',
    },
  ]

  return (
    <section id="how-it-works" className="relative py-20 md:py-28 bg-card/40 border-y border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            Step-by-Step Pathway Intelligence
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            How Forkora Works
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-muted-foreground">
            From where you are today to the possibilities ahead.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon
            return (
              <Card
                key={item.step}
                className="group relative flex flex-col justify-between overflow-hidden border-border bg-card/90 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 rounded-2xl"
              >
                {/* Step Connector Line on Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 right-0 w-8 h-px bg-border translate-x-4 z-10" />
                )}

                <CardHeader className="p-6 pb-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${item.iconBg} transition-transform duration-300 group-hover:scale-110 shadow-xs`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-black text-muted-foreground/30 font-mono">
                      {item.step}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    {item.badgeText}
                  </span>

                  <CardTitle className="text-xl font-bold mt-1 text-foreground">
                    {item.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 pt-2">
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </CardDescription>

                  <div className="mt-6 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Learn about step {item.step} <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

      </div>
    </section>
  )
}
