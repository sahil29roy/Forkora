import { ArrowRight, Compass, ShieldCheck, GitFork, Milestone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PathwayPreview } from './PathwayPreview'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-18 md:pb-28 lg:pt-22 lg:pb-32 bg-grid-pattern">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[450px] w-[600px] rounded-full bg-primary/10 blur-[130px] -translate-y-12" />
        <div className="h-[350px] w-[450px] rounded-full bg-accent/10 blur-[120px] translate-x-36 translate-y-24" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Heading & Content (55% on desktop) */}
          <div className="flex flex-col items-start text-left lg:col-span-7 pr-0 lg:pr-6">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 shadow-xs backdrop-blur-xs transition-all hover:border-primary/40 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
                Explore • Compare • Decide
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[3.75rem] leading-[1.08]">
              Your Future. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Visualized.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Explore academic and career pathways, understand your options, evaluate switching costs, and make informed decisions with Forkora.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold h-12 px-7 rounded-xl shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
                onClick={() => window.location.href = '/signup'}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-border bg-card/80 hover:bg-muted/60 text-foreground text-sm font-semibold h-12 px-6 rounded-xl shadow-xs"
                onClick={() => {
                  const el = document.getElementById('pathway-preview')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Compass className="mr-2 h-4 w-4 text-primary" />
                Explore Paths
              </Button>
            </div>

            {/* Supporting Micro-Trust Metrics */}
            <div className="mt-10 pt-8 border-t border-border/70 grid grid-cols-3 gap-4 w-full max-w-lg">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <GitFork className="h-3.5 w-3.5 text-primary" />
                  Graph Structure
                </span>
                <p className="mt-1 text-sm font-bold text-foreground">Multi-Branching</p>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  Eligibility
                </span>
                <p className="mt-1 text-sm font-bold text-foreground">100% Deterministic</p>
              </div>

              <div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Milestone className="h-3.5 w-3.5 text-indigo-400" />
                  Flexibility
                </span>
                <p className="mt-1 text-sm font-bold text-foreground">Reversibility Index</p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Pathway Visualization (45% on desktop) */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <PathwayPreview />
          </div>

        </div>
      </div>
    </section>
  )
}
