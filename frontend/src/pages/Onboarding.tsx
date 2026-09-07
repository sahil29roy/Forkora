import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Compass, GraduationCap, School } from 'lucide-react'
import { ForkoraLogo } from '@/components/brand/ForkoraLogo'
import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/components/auth/ThemeSelector'
import { useAuth } from '@/context/AuthContext'

export function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col antialiased">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-5 lg:px-12 lg:py-6 border-b border-border/50">
        <ForkoraLogo />
        <ThemeSelector />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-card border border-border shadow-xl space-y-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome to Forkora Pathway Engine</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Let's Personalize Your Academic Pathway
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-md mx-auto">
              {user?.display_name ? `Hey ${user.display_name}! ` : ''}
              Tell us about your current school grade and target career interests to generate your custom simulation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl border border-border bg-background space-y-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <School className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold">1. School & Class</h4>
              <p className="text-xs text-muted">Select current academic grade</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background space-y-2">
              <div className="h-8 w-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <Compass className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold">2. Stream & Skills</h4>
              <p className="text-xs text-muted">Pick subjects and strengths</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background space-y-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold">3. Dream Careers</h4>
              <p className="text-xs text-muted">Explore target professions</p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto h-11 px-8 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground flex items-center justify-center gap-2"
            >
              <span>Begin Pathway Setup</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
