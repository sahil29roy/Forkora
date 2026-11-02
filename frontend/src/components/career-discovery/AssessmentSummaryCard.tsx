import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BrainCircuit,
  Users,
  Compass,
  ArrowRight,
  Clock,
} from 'lucide-react';
import type { AssessmentOverviewMetric } from '@/types/career.types';

interface AssessmentSummaryCardProps {
  metrics: AssessmentOverviewMetric[];
  className?: string;
}

export const AssessmentSummaryCard: React.FC<AssessmentSummaryCardProps> = ({
  metrics,
  className = '',
}) => {
  const navigate = useNavigate();

  const getMetricIcon = (id: string) => {
    switch (id.toLowerCase()) {
      case 'academic':
        return BookOpen;
      case 'aptitude':
        return BrainCircuit;
      case 'behavioural':
        return Users;
      case 'situational':
        return Compass;
      default:
        return BrainCircuit;
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl bg-card border border-border shadow-2xs flex flex-col justify-between text-left space-y-4 ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
          Your Assessment Summary
        </h3>
        <button
          onClick={() => navigate('/assessments')}
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* 4 Assessment Metrics in Horizontal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {metrics.map((metric) => {
          const Icon = getMetricIcon(metric.id);
          const isCompleted = metric.status === 'completed';
          const progressPercent = Math.min(
            100,
            Math.max(0, Math.round((metric.scoreValue / metric.maxValue) * 100))
          );

          return (
            <div
              key={metric.id}
              className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col justify-between space-y-2.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                  {metric.name}
                </span>
                <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              <div>
                {isCompleted ? (
                  <div className="space-y-1.5">
                    <p className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                      {metric.scoreText}
                    </p>
                    <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                      <Clock className="h-3 w-3" />
                      <span>{metric.status === 'in_progress' ? 'In Progress' : 'Pending'}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted/30" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
