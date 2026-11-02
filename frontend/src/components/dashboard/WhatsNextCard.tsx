import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListChecks,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import type { ModuleProgressDTO } from '@/types/assessment.types';

interface WhatsNextCardProps {
  modules: ModuleProgressDTO[];
  savedCareersCount: number;
  className?: string;
}

export const WhatsNextCard: React.FC<WhatsNextCardProps> = ({
  modules,
  savedCareersCount,
  className = '',
}) => {
  const navigate = useNavigate();

  const incompleteModule = modules.find((m) => m.status !== 'COMPLETED');
  const allModulesCompleted = modules.length > 0 && !incompleteModule;

  const tasks = [
    {
      id: 'assessment',
      title: allModulesCompleted
        ? 'All 4 Assessments Completed'
        : `Complete ${incompleteModule?.title.replace(' Assessment', '') || 'Diagnostic'} Assessment`,
      desc: allModulesCompleted
        ? 'Diagnostic profile calibration is complete'
        : 'Essential for personalized career compatibility scoring',
      isCompleted: allModulesCompleted,
      actionText: allModulesCompleted ? 'View Results' : 'Start Now',
      href: allModulesCompleted
        ? '/assessments'
        : `/assessments/${incompleteModule?.module_id || 'academic'}/instructions`,
      isLocked: false,
    },
    {
      id: 'discovery',
      title: 'Explore Career Discovery Recommendations',
      desc: 'Inspect compatibility breakdowns, salary data, and matching reasons',
      isCompleted: false,
      actionText: 'Discover',
      href: '/career-discovery',
      isLocked: false,
    },
    {
      id: 'save',
      title: 'Save your top preferred careers',
      desc: savedCareersCount > 0 ? `${savedCareersCount} career(s) bookmarked` : 'Shortlist pathways for comparison',
      isCompleted: savedCareersCount > 0,
      actionText: savedCareersCount > 0 ? 'View Saved' : 'Explore',
      href: savedCareersCount > 0 ? '/saved-paths' : '/career-discovery',
      isLocked: false,
    },
    {
      id: 'compare',
      title: 'Compare shortlisted career routes',
      desc: 'Analyze prerequisite differences, degree lengths, and salary bands',
      isCompleted: false,
      actionText: 'Compare',
      href: '/compare',
      isLocked: false,
    },
    {
      id: 'simulation',
      title: 'What-if Pathway Simulation Engine',
      desc: 'Simulate switching streams or degree options before committing',
      isCompleted: false,
      actionText: 'Coming Soon',
      href: '#',
      isLocked: true,
    },
  ];

  return (
    <div
      className={`p-6 rounded-2xl bg-card border border-border shadow-2xs text-left space-y-4 flex flex-col justify-between ${className}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            What's Next?
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Recommended actions to move forward on your career journey.
        </p>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
              task.isCompleted
                ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                : task.isLocked
                ? 'bg-muted/10 border-border/40 opacity-75'
                : 'bg-card border-border hover:border-primary/40 hover:bg-muted/15'
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              {task.isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : task.isLocked ? (
                <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold leading-tight truncate ${
                    task.isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{task.desc}</p>
              </div>
            </div>

            {task.isLocked ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted/30 text-muted-foreground border border-border shrink-0">
                Coming Soon
              </span>
            ) : (
              <button
                onClick={() => navigate(task.href)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-primary hover:bg-primary/10 border border-primary/20 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>{task.actionText}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
