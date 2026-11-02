import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  BrainCircuit,
  Compass,
  GitBranch,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import type { JourneyStage } from '@/types/dashboard.types';

interface JourneyAtAGlanceProps {
  stages: JourneyStage[];
  className?: string;
}

export const JourneyAtAGlance: React.FC<JourneyAtAGlanceProps> = ({
  stages,
  className = '',
}) => {
  const navigate = useNavigate();

  const getStageIcon = (id: string) => {
    switch (id) {
      case 'academic_profile':
        return UserCheck;
      case 'assessments':
        return BrainCircuit;
      case 'career_discovery':
        return Compass;
      case 'career_graph':
        return GitBranch;
      case 'saved_compare':
        return BookmarkCheck;
      default:
        return Compass;
    }
  };

  const getStatusBadge = (status: JourneyStage['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
          label: 'Completed',
        };
      case 'in_progress':
        return {
          icon: Clock,
          color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
          label: 'In Progress',
        };
      case 'available':
        return {
          icon: ArrowRight,
          color: 'text-primary bg-primary/10 border-primary/20',
          label: 'Available',
        };
      default:
        return {
          icon: Clock,
          color: 'text-muted bg-muted/30 border-border',
          label: 'Not Started',
        };
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl bg-card border border-border shadow-xs text-left space-y-4 flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Your Journey at a Glance
          </h3>
          <p className="text-xs text-muted">
            Track your progress across the key steps of your career exploration journey.
          </p>
        </div>
        <button
          onClick={() => navigate('/career-discovery')}
          className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>View Full Journey</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* 5 Connected Stages Row with subtle arrows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 relative">
        {stages.map((stage, idx) => {
          const Icon = getStageIcon(stage.id);
          const statusConfig = getStatusBadge(stage.status);
          const isCompleted = stage.status === 'completed';

          return (
            <div key={stage.id} className="relative">
              <div
                onClick={() => navigate(stage.href)}
                className="group p-3.5 rounded-xl bg-muted/15 border border-border/70 hover:border-primary/40 hover:bg-muted/25 transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-3 h-full"
              >
                {/* Top step number and icon */}
                <div className="flex items-center justify-between">
                  <span className="h-6 w-6 rounded-lg bg-card border border-border text-foreground font-bold text-xs flex items-center justify-center">
                    {stage.step}
                  </span>

                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5 truncate">
                    {stage.subtitle}
                  </p>
                </div>

                {/* Status Pill */}
                <div className="pt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusConfig.color}`}
                  >
                    <statusConfig.icon className="h-3 w-3" />
                    <span>{statusConfig.label}</span>
                  </span>
                </div>
              </div>

              {/* Subtle connector arrow between stages on desktop */}
              {idx < stages.length - 1 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-muted/60">
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
