import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Award,
  Briefcase,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import type { CareerPathway } from '@/types/career.types';

interface SuggestedPathwayPreviewProps {
  careerTitle: string;
  careerCode: string;
  pathways?: CareerPathway[];
  className?: string;
}

export const SuggestedPathwayPreview: React.FC<SuggestedPathwayPreviewProps> = ({
  careerTitle,
  careerCode,
  pathways = [],
  className = '',
}) => {
  const navigate = useNavigate();
  const primaryPathway = pathways[0];

  // Helper to resolve node icon based on title or position
  const getNodeIcon = (nodeName: string, idx: number, total: number) => {
    const lower = nodeName.toLowerCase();
    if (idx === total - 1 || lower.includes('engineer') || lower.includes('doctor') || lower.includes('scientist') || lower.includes('analyst') || lower.includes('lawyer')) {
      return Briefcase;
    }
    if (lower.includes('degree') || lower.includes('b.tech') || lower.includes('b.sc') || lower.includes('mbbs') || lower.includes('bba') || lower.includes('ba')) {
      return Award;
    }
    if (lower.includes('exam') || lower.includes('jee') || lower.includes('neet') || lower.includes('clat') || lower.includes('cuet')) {
      return FileText;
    }
    if (lower.includes('stream') || lower.includes('science') || lower.includes('commerce') || lower.includes('humanities')) {
      return BookOpen;
    }
    return GraduationCap;
  };

  const defaultNodes = [
    'Class 10',
    'Class 12 Science (PCM)',
    'JEE Main',
    'B.Tech (CSE)',
    careerTitle || 'Software Engineer',
  ];

  const displayNodes = primaryPathway && primaryPathway.nodes.length > 0 ? primaryPathway.nodes : defaultNodes;

  return (
    <div className={`p-4 rounded-xl bg-muted/15 border border-border/60 flex flex-col justify-between ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <GitBranch className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Suggested Pathway (Preview)
            </h4>
          </div>
          <button
            onClick={() => navigate(`/career-graph?career=${encodeURIComponent(careerCode)}`)}
            className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Graph</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Nodes Timeline / Chain */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {displayNodes.map((node, idx) => {
            const Icon = getNodeIcon(node, idx, displayNodes.length);
            const isLast = idx === displayNodes.length - 1;

            return (
              <React.Fragment key={`${node}-${idx}`}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isLast
                      ? 'bg-primary/10 text-primary border-primary/25 font-semibold'
                      : 'bg-card text-foreground border-border/70 shadow-2xs'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${isLast ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="truncate max-w-[140px] sm:max-w-none">{node}</span>
                </div>

                {!isLast && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Alternative Routes Note */}
      <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {pathways.length > 1
            ? `${pathways.length} alternative pathways verified in graph`
            : 'Alternative lateral & direct pathways available'}
        </span>
        {primaryPathway?.total_duration_months ? (
          <span className="font-medium text-foreground">
            ~{Math.round(primaryPathway.total_duration_months / 12)} years route
          </span>
        ) : null}
      </div>
    </div>
  );
};
