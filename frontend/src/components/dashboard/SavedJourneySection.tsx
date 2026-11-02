import { Link } from 'react-router-dom';
import {
  Bookmark,
  Briefcase,
  GitCompare,
  ArrowRight,
  Clock,
  Compass,
  GitBranch,
  BrainCircuit,
  Inbox,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RecentActivityItem } from '@/types/dashboard.types';

interface SavedJourneySectionProps {
  savedPathsCount: number;
  savedCareersCount: number;
  comparisonsCount: number;
  recentActivities: RecentActivityItem[];
}

export function SavedJourneySection({
  savedPathsCount,
  savedCareersCount,
  comparisonsCount,
  recentActivities,
}: SavedJourneySectionProps) {
  const getActivityIcon = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'career':
        return <Briefcase className="h-4 w-4 text-primary" />;
      case 'pathway':
        return <GitBranch className="h-4 w-4 text-accent" />;
      case 'comparison':
        return <GitCompare className="h-4 w-4 text-indigo-500" />;
      case 'assessment':
        return <BrainCircuit className="h-4 w-4 text-purple-500" />;
      default:
        return <Compass className="h-4 w-4 text-primary" />;
    }
  };

  const getActivityTypeLabel = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'career':
        return 'Career Bookmark';
      case 'pathway':
        return 'Pathway Map';
      case 'comparison':
        return 'Comparison Matrix';
      case 'assessment':
        return 'Assessment Module';
      default:
        return 'Activity';
    }
  };

  return (
    <section className="rounded-2xl bg-card border border-border p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground tracking-tight">Your Saved Journey</h2>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Your recent activity, saved paths and comparisons.
          </p>
        </div>
        <Link to="/saved-paths">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary hover:text-primary-hover hover:bg-primary/10 gap-1.5 rounded-xl cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Main Grid: 3 Summary Cards + Recent Activity List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3 Metric Cards (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5">
          {/* Card 1: Saved Paths */}
          <Link
            to="/saved-paths"
            className="group p-4 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/70 hover:border-primary/40 transition-all duration-150 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
                <GitBranch className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-muted">Saved Paths</p>
                <p className="text-xl font-extrabold text-foreground tracking-tight">
                  {savedPathsCount}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Card 2: Saved Careers */}
          <Link
            to="/career-discovery"
            className="group p-4 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/70 hover:border-primary/40 transition-all duration-150 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-muted">Saved Careers</p>
                <p className="text-xl font-extrabold text-foreground tracking-tight">
                  {savedCareersCount}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Card 3: Comparisons */}
          <Link
            to="/compare"
            className="group p-4 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/70 hover:border-primary/40 transition-all duration-150 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <GitCompare className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-muted">Comparisons</p>
                <p className="text-xl font-extrabold text-foreground tracking-tight">
                  {comparisonsCount}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Right Column: Recent Activity List or Empty State (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="p-4 sm:p-5 rounded-xl bg-muted/15 border border-border/70 h-full flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Recent Activity
                </h3>
              </div>
              <span className="text-[11px] text-muted">
                {recentActivities.length > 0 ? `${recentActivities.length} items logged` : 'No logs yet'}
              </span>
            </div>

            {/* List or Empty State */}
            {recentActivities.length > 0 ? (
              <div className="divide-y divide-border/50 overflow-hidden">
                {recentActivities.slice(0, 4).map((activity) => (
                  <div
                    key={activity.id}
                    className="py-3 flex items-center justify-between gap-3 text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-card border border-border/70 flex items-center justify-center shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-muted">
                          <span>{getActivityTypeLabel(activity.type)}</span>
                          <span>•</span>
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <Link to={activity.href} className="shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs text-muted hover:text-primary hover:bg-primary/10 rounded-lg gap-1 cursor-pointer"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Inbox className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-foreground">
                  You haven&apos;t saved any pathways yet.
                </p>
                <p className="text-xs text-muted max-w-sm mt-1 mb-4 leading-relaxed">
                  Start exploring Career Discovery to build your shortlist and compare options.
                </p>
                <Link to="/career-discovery">
                  <Button
                    size="sm"
                    className="text-xs bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl gap-1.5 cursor-pointer shadow-xs shadow-primary/20"
                  >
                    <span>Start Exploring Careers</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
