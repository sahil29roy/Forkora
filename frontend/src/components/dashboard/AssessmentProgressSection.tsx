import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BrainCircuit,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  Play,
} from 'lucide-react';
import type { ModuleProgressDTO } from '@/types/assessment.types';

interface AssessmentProgressSectionProps {
  modules: ModuleProgressDTO[];
  className?: string;
}

export const AssessmentProgressSection: React.FC<AssessmentProgressSectionProps> = ({
  modules,
  className = '',
}) => {
  const navigate = useNavigate();

  const completedCount = modules.filter((m) => m.status === 'COMPLETED').length;
  const totalCount = modules.length || 4;

  const getModuleConfig = (id: string) => {
    switch (id.toLowerCase()) {
      case 'academic':
        return {
          name: 'Academic Assessment',
          icon: GraduationCap,
          desc: 'Core subject comprehension',
        };
      case 'aptitude':
        return {
          name: 'Aptitude Assessment',
          icon: BrainCircuit,
          desc: 'Logical deduction & reasoning',
        };
      case 'behavioural':
        return {
          name: 'Behavioural Assessment',
          icon: Users,
          desc: 'Learning style & initiative',
        };
      case 'situational':
        return {
          name: 'Situational Assessment',
          icon: Compass,
          desc: 'Practical judgment & ethics',
        };
      default:
        return {
          name: 'Assessment',
          icon: BrainCircuit,
          desc: 'Exploration module',
        };
    }
  };

  return (
    <div className={`space-y-4 text-left ${className}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Assessment Progress
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {completedCount} of {totalCount} Completed
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete the 4 diagnostic modules to unlock high-accuracy career discovery recommendations.
          </p>
        </div>

        <button
          onClick={() => navigate('/assessments')}
          className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>View All Modules</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* 4 Assessment Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((m) => {
          const config = getModuleConfig(m.module_id);
          const isCompleted = m.status === 'COMPLETED';
          const isInProgress = m.status === 'IN_PROGRESS';
          const Icon = config.icon;

          let scoreDisplay = 'Not Started';
          let progressVal = 0;

          if (isCompleted && m.score !== null) {
            if (m.module_id === 'behavioural' || m.module_id === 'situational') {
              scoreDisplay = `${(Number(m.score) / 20).toFixed(1)} / 5`;
              progressVal = 100;
            } else {
              scoreDisplay = `${Math.round(Number(m.score))}%`;
              progressVal = Math.round(Number(m.score));
            }
          } else if (isInProgress) {
            scoreDisplay = 'In Progress';
            progressVal = m.progress_percentage || 50;
          }

          return (
            <div
              key={m.module_id}
              className="p-4 rounded-2xl bg-card border border-border shadow-2xs hover:border-primary/40 transition-all duration-150 flex flex-col justify-between space-y-3.5 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>

                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Completed</span>
                  </span>
                ) : isInProgress ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20">
                    <Clock className="h-3 w-3" />
                    <span>In Progress</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-muted-foreground bg-muted/30 border border-border">
                    <span>Not Started</span>
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground leading-snug">{config.name}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{config.desc}</p>
              </div>

              {/* Score / Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground text-[11px]">Score</span>
                  <span className={isCompleted ? 'text-primary font-bold' : 'text-foreground font-medium'}>
                    {scoreDisplay}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-primary' : isInProgress ? 'bg-amber-500' : 'bg-transparent'
                    }`}
                    style={{ width: `${progressVal}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  navigate(
                    isCompleted && m.attempt_id
                      ? `/assessments/${m.module_id}/${m.attempt_id}/results`
                      : `/assessments/${m.module_id}/instructions`
                  )
                }
                className="w-full py-2 px-3 rounded-xl border border-border hover:border-primary/50 text-xs font-semibold text-primary hover:bg-primary/[0.04] transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <span>{isCompleted ? 'View Details' : isInProgress ? 'Resume' : 'Start Assessment'}</span>
                {isCompleted ? <ArrowRight className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
