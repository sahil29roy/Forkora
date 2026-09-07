import { useState } from 'react'
import { Check, ArrowRight, GitFork, Layers, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function PathwayFeature() {
  const [activeStage, setActiveStage] = useState<number>(2)

  const featureBullets = [
    'Explore multiple pathways from your current position',
    'Understand deterministic eligibility requirements',
    'Inspect examination and academic transition gates',
    'Understand switching costs and required preparation time',
    'Discover alternative and lateral career routes',
  ]

  return (
    <section id="pathway-preview" className="relative py-20 md:py-28 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Large Pathway Visualization (7 cols on desktop) */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="relative rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl shadow-primary/5">
              
              {/* Header inside Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <GitFork className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Interactive Pathway Map</h3>
                    <p className="text-xs text-muted-foreground">Class 12 to Specialization Lifecycle</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border">
                  {[1, 2, 3].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setActiveStage(step)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeStage === step
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Stage {step}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pathway Visual Architecture */}
              <div className="py-6 space-y-4">
                
                {/* Node 1: Origin */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-background/80 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                      01
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Academic Foundation</span>
                      <p className="text-sm font-semibold text-foreground">Class 12 • Science (PCM / Computer Science)</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs text-muted-foreground">Entry Gate</Badge>
                </div>

                {/* Transition Arrow 1 */}
                <div className="flex justify-center my-1">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 border border-border text-[11px] text-muted-foreground">
                    <span>Entrance Exam: JEE / State CET</span>
                    <span className="h-1 w-1 rounded-full bg-accent"></span>
                    <span className="text-accent font-medium">Reversible: 95%</span>
                  </div>
                </div>

                {/* Node 2: Undergraduate Degree */}
                <div className={`p-4 rounded-xl border-2 transition-all ${
                  activeStage >= 2 
                    ? 'border-primary bg-primary/5 dark:bg-primary/15 shadow-sm ring-1 ring-primary/30' 
                    : 'border-border bg-background'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-xs">
                        🎓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">B.Tech Computer Science & Engineering</h4>
                          <Badge variant="default" className="text-[10px] py-0">Degree</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">4 Years • Core Algorithms, Systems, & Applied Engineering</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-semibold text-accent">High Flexibility</span>
                      <span className="text-[11px] text-muted-foreground block">Switch Cost: Low</span>
                    </div>
                  </div>
                </div>

                {/* Transition Arrow 2 */}
                <div className="flex justify-center my-1">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 border border-border text-[11px] text-muted-foreground">
                    <span>Specialization & Transition Stage</span>
                  </div>
                </div>

                {/* Branching Nodes 3: Multiple Outcomes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-primary/40 bg-card hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-foreground">Software Dev</span>
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">Full-Stack, Backend, Distributed Systems</p>
                    <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-[10px]">
                      <span className="text-accent font-semibold">Lateral: High</span>
                      <span className="text-muted-foreground">Cost: Low</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-accent/50 bg-card hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-foreground">Data Science & AI</span>
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">Machine Learning, Analytics, Big Data</p>
                    <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-[10px]">
                      <span className="text-accent font-semibold">Lateral: Med</span>
                      <span className="text-muted-foreground">Cost: Med</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-card hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-foreground">Cyber Security</span>
                      <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">Infosec, Cryptography, SecOps</p>
                    <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-[10px]">
                      <span className="text-accent font-semibold">Specialized</span>
                      <span className="text-muted-foreground">Cost: Med</span>
                    </div>
                  </div>
                </div>

                {/* Alternative Routes Notification */}
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-accent" />
                    <span>Lateral Routes: Product Management, Tech Consulting, UI/UX Systems</span>
                  </div>
                  <span className="text-[10px] font-semibold text-primary">Explore All 24 Options →</span>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Feature Checklist (5 cols on desktop) */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Layers className="h-3.5 w-3.5" />
              Dynamic Graph Exploration
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl leading-tight">
              Not one career. <br />
              <span className="text-primary">Multiple possible paths.</span>
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed">
              Forkora helps you explore the decisions that connect your current academic position to possible future pathways.
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Instead of presenting one fixed recommendation, Forkora lets you see the routes available from your current position, understand what is required at each transition, and choose with full transparency.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3 pt-2">
              {featureBullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{bullet}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-7 rounded-xl shadow-sm"
                onClick={() => window.location.href = '/explore'}
              >
                Explore Pathways
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
