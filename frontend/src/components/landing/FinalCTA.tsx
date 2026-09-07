import { ArrowRight, Compass, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCTA() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl border border-primary/20 bg-card p-8 sm:p-12 md:p-16 text-center shadow-2xl shadow-primary/5 overflow-hidden">
          
          {/* Ambient Subtle Indigo/Teal Radial Glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-[300px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
            <div className="h-[200px] w-[350px] rounded-full bg-accent/10 blur-[90px] translate-y-12" />
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Begin Your Pathway Exploration
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl leading-tight">
              Your path is not a single decision.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Explore your possibilities with Forkora. Understand requirements, compare alternatives, and make informed educational transitions.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-8 rounded-xl shadow-md shadow-primary/20 transition-all hover:shadow-lg"
                onClick={() => window.location.href = '/signup'}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-border bg-background hover:bg-muted/60 text-foreground font-semibold h-12 px-7 rounded-xl shadow-xs"
                onClick={() => {
                  const el = document.getElementById('pathway-preview')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Compass className="mr-2 h-4 w-4 text-primary" />
                Explore Paths
              </Button>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
