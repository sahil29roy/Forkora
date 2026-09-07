import { ShieldCheck, ArrowLeftRight, GitBranch, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function CoreFeatures() {
  const differentiators = [
    {
      title: 'Know what is possible.',
      category: 'Eligibility',
      icon: ShieldCheck,
      description: 'Understand the academic requirements, subject combinations, and statutory prerequisites associated with any educational pathway.',
      bullets: [
        'Deterministic rule verification',
        'Board & stream requirements',
        'Mandatory entrance exam checks',
      ],
      iconBg: 'bg-primary/10 text-primary border-primary/20',
      badge: 'Academic Criteria',
    },
    {
      title: 'Understand the cost of changing direction.',
      category: 'Switching Cost',
      icon: ArrowLeftRight,
      description: 'See the academic effort, time, bridge examinations, and credential transitions required when shifting from one field to another.',
      bullets: [
        'Preparation time estimations',
        'Subject prerequisite bridges',
        'Lateral entry pathway mapping',
      ],
      iconBg: 'bg-accent/15 text-accent dark:text-accent-foreground border-accent/20',
      badge: 'Transition Effort',
    },
    {
      title: 'See how flexible a path is.',
      category: 'Reversibility',
      icon: GitBranch,
      description: 'Understand whether alternative routes and lateral options remain available or if a decision locks you into a highly specialized track.',
      bullets: [
        'Reversible vs locked-in analysis',
        'Alternative exit options',
        'Degree versatility indicators',
      ],
      iconBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      badge: 'Path Versatility',
    },
  ]

  return (
    <section id="features" className="relative py-20 md:py-28 bg-card/40 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent dark:text-accent-foreground mb-3">
            Evidence-Based Decision Context
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Make Better Decisions With Context
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-muted-foreground">
            Clear, transparent decision criteria without opaque predictions or false certainty.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {differentiators.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.category}
                className="group relative flex flex-col justify-between rounded-2xl border-border bg-card p-2 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${item.iconBg} transition-transform duration-300 group-hover:scale-105 shadow-xs`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider rounded-md bg-muted/40 px-2 py-1 border border-border">
                      {item.badge}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    {item.category}
                  </span>

                  <CardTitle className="text-xl font-bold mt-1 text-foreground leading-snug">
                    {item.title}
                  </CardTitle>

                  <CardDescription className="text-sm leading-relaxed text-muted-foreground mt-3">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-0 border-t border-border/60 mt-4">
                  <ul className="space-y-2.5 pt-4">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2.5 text-xs text-foreground/90 font-medium">
                        <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

      </div>
    </section>
  )
}
