import { useNavigate } from 'react-router-dom'
import { Sparkles, BrainCircuit, Heart, Compass, Clock, CheckCircle2, ArrowRight, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader'

export function AssessmentIntro() {
  const navigate = useNavigate()

  const assessmentModules = [
    {
      title: 'Aptitude & Problem Solving',
      description: 'Evaluate your analytical reasoning, pattern discovery, and logical decision-making skills.',
      icon: BrainCircuit,
      duration: '5 mins',
    },
    {
      title: 'Interests & Passions',
      description: 'Uncover the subjects, industries, and creative domains that truly energize your curiosity.',
      icon: Heart,
      duration: '5 mins',
    },
    {
      title: 'Work Style & Environment',
      description: 'Identify whether you thrive in fast-paced teams, research labs, hybrid settings, or independent pursuits.',
      icon: Compass,
      duration: '5 mins',
    },
  ]

  const highlights = [
    'No right or wrong answers — this is designed to understand who you are.',
    'Takes approximately 15 minutes to complete with zero pressure.',
    'You can pause and resume at any point from your dashboard.',
    'Instant generation of your personalized career roadmaps and course recommendations.',
  ]

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Header */}
      <OnboardingHeader currentStep="review" />

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-8 md:px-12 flex flex-col justify-center items-center text-left">
        <div className="w-full space-y-8 animate-fade-in">
          {/* Header Badge & Title */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Academic Profile Confirmed</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Welcome to Your Career Assessment
            </h1>

            <p className="text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
              Congratulations! Your academic profile has been safely saved. Before generating your personalized career graphs, take this guided assessment to discover your strengths, ideal streams, and future possibilities.
            </p>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {assessmentModules.map((module) => {
              const Icon = module.icon

              return (
                <div
                  key={module.title}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-3 flex flex-col justify-between hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="text-base font-bold text-foreground">
                      {module.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>~{module.duration}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Assessment Guidelines Box */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 space-y-3">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>What to Keep in Mind</span>
            </h4>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-foreground/90">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Navigation */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3.5 sm:gap-4 border-t border-border/70">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto gap-2 text-xs sm:text-sm font-semibold rounded-xl border-border h-11 px-5"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Go to Dashboard First</span>
            </Button>

            <Button
              onClick={() => navigate('/dashboard')} // In future or next sprint, connects to /assessment/start
              className="w-full sm:w-auto gap-2 text-xs sm:text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 h-11 px-6"
            >
              <span>Start Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
