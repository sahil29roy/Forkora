import { useNavigate } from 'react-router-dom'
import { User, Compass, Sparkles, GitBranch, ArrowRight, BrainCircuit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/context/AuthContext'

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <AppLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-8 animate-fade-in text-left">
        {/* Welcome Card */}
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
                {user?.email || 'Logged in to Forkora'} • Role:{' '}
                <span className="font-semibold text-primary">{user?.role || 'STUDENT'}</span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/onboarding')}
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>Update Preferences</span>
          </Button>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Action 1: Career Assessments */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Career Assessments</h3>
              <p className="text-xs text-muted leading-relaxed">
                Complete modules across interests, aptitude, and learning preferences to build your profile.
              </p>
            </div>
            <Button
              onClick={() => navigate('/assessments')}
              className="w-full gap-2 text-xs bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl"
              size="sm"
            >
              <span>View Assessments</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Action 2: Explore Career Pathways */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Explore Career Pathways</h3>
              <p className="text-xs text-muted leading-relaxed">
                Explore interconnected career branches, college degree prerequisites, and salary trends.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs rounded-xl">
              <span>View Pathways</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Action 3: Pathway Simulation */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <GitBranch className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Pathway Simulation</h3>
              <p className="text-xs text-muted leading-relaxed">
                Run what-if scenario analyses on switching streams or targeting alternative college degrees.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs rounded-xl">
              <span>Launch Simulator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Action 4: AI Recommendations */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">AI Recommendations</h3>
              <p className="text-xs text-muted leading-relaxed">
                Get personalized next-step academic milestones tailored to your strengths and goals.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs rounded-xl">
              <span>View Advice</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
