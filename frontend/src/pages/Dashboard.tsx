import { useNavigate } from 'react-router-dom'
import { LogOut, User, Compass, Sparkles, GitBranch, ArrowRight } from 'lucide-react'
import { ForkoraLogo } from '@/components/brand/ForkoraLogo'
import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/components/auth/ThemeSelector'
import { useAuth } from '@/context/AuthContext'

export function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col antialiased">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-5 lg:px-12 lg:py-6 border-b border-border/50">
        <ForkoraLogo />
        <div className="flex items-center gap-3">
          <ThemeSelector />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2 text-xs font-medium"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
              {user?.display_name ? user.display_name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome, {user?.display_name || 'Explorer'}!
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                {user?.email || 'Logged in to Forkora'} • Role: <span className="font-semibold text-primary">{user?.role || 'STUDENT'}</span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/onboarding')}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>Update Preferences</span>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Explore Career Pathways</h3>
            <p className="text-xs text-muted leading-relaxed">
              Explore interconnected career branches, college degree prerequisites, and salary trends.
            </p>
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
              <span>View Pathways</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <GitBranch className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Pathway Simulation</h3>
            <p className="text-xs text-muted leading-relaxed">
              Run what-if scenario analyses on switching streams or targeting alternative college degrees.
            </p>
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
              <span>Launch Simulator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">AI Recommendations</h3>
            <p className="text-xs text-muted leading-relaxed">
              Get personalized next-step academic milestones tailored to your strengths and goals.
            </p>
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
              <span>View Advice</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
