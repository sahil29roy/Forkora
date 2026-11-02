import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Compass, Bookmark, GitCompare, ArrowRight } from 'lucide-react';

interface ContinueExploringSectionProps {
  className?: string;
  columns?: 2 | 4;
}

export const ContinueExploringSection: React.FC<ContinueExploringSectionProps> = ({
  className = '',
  columns = 2,
}) => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Career Graph',
      description: 'Explore education pathways, alternative routes and eligibility.',
      actionText: 'Explore Graph',
      icon: GitBranch,
      color: 'bg-primary/10 text-primary',
      href: '/career-graph',
    },
    {
      title: 'Career Discovery',
      description: 'Discover careers aligned with your background and interests.',
      actionText: 'Discover Careers',
      icon: Compass,
      color: 'bg-accent/15 text-accent',
      href: '/career-discovery',
    },
    {
      title: 'Saved Paths',
      description: 'Revisit your saved education and career pathways.',
      actionText: 'View Saved Paths',
      icon: Bookmark,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      href: '/saved-paths',
    },
    {
      title: 'Compare Careers',
      description: 'Compare shortlisted careers, skills and education routes.',
      actionText: 'Compare Careers',
      icon: GitCompare,
      color: 'bg-indigo-500/10 text-indigo-500',
      href: '/compare',
    },
  ];

  const gridClass =
    columns === 4
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
      : 'grid grid-cols-1 sm:grid-cols-2 gap-3.5';

  return (
    <div className={`space-y-4 text-left ${className}`}>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
          Continue Exploring
        </h3>
        <p className="text-xs text-muted">
          Explore key features to plan, analyze and compare your career paths.
        </p>
      </div>

      <div className={gridClass}>
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-5 rounded-2xl bg-card border border-border shadow-2xs hover:border-primary/40 transition-all duration-150 flex flex-col justify-between space-y-4 text-left"
            >
              <div className="space-y-2.5">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-foreground">{item.title}</h4>
                <p className="text-xs text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => navigate(item.href)}
                className="w-full py-2 px-3 rounded-xl border border-border hover:border-primary/50 text-xs font-semibold text-primary hover:bg-primary/[0.04] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{item.actionText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
