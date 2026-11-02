import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Bookmark,
  GitCompare,
  Code,
  Database,
  Shield,
  Stethoscope,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import type { CareerRecommendationItem } from '@/types/career.types';

interface CareerDiscoveriesCardProps {
  topCareer: CareerRecommendationItem | null;
  totalRecommendationsCount: number;
  savedCareersCount: number;
  comparisonsCount: number;
  className?: string;
}

export const CareerDiscoveriesCard: React.FC<CareerDiscoveriesCardProps> = ({
  topCareer,
  totalRecommendationsCount,
  savedCareersCount,
  comparisonsCount,
  className = '',
}) => {
  const navigate = useNavigate();

  const getCareerIcon = (code?: string) => {
    const c = (code || '').toUpperCase();
    if (c.includes('SOFTWARE')) return Code;
    if (c.includes('DATA')) return Database;
    if (c.includes('CYBER') || c.includes('SECURITY')) return Shield;
    if (c.includes('DOCTOR') || c.includes('BIOTECH')) return Stethoscope;
    return Briefcase;
  };

  const Icon = getCareerIcon(topCareer?.career_code);

  return (
    <div
      className={`p-6 rounded-2xl bg-card border border-border shadow-2xs text-left space-y-4 flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Your Career Discoveries
          </h3>
        </div>
        <button
          onClick={() => navigate('/career-discovery')}
          className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View Recommendations</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left Side: Top Career Highlight (7 cols) */}
        <div className="md:col-span-7 p-4 sm:p-5 rounded-2xl bg-primary/[0.04] dark:bg-primary/[0.08] border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/25 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              <span>Top Match</span>
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              High Match
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                {topCareer?.career || 'Software Engineer'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {topCareer?.domain || 'Technology · Engineering · Development'}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-muted-foreground">Compatibility Score</span>
              <span className="text-primary text-sm font-extrabold">
                {topCareer?.compatibilityScore || 86}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${topCareer?.compatibilityScore || 86}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: 3 Compact Summary Rows (5 cols) */}
        <div className="md:col-span-5 space-y-2.5">
          <div
            onClick={() => navigate('/career-discovery')}
            className="p-3 rounded-xl bg-muted/15 border border-border/60 hover:border-primary/40 hover:bg-muted/25 transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Recommended Careers</p>
                <p className="text-[10px] text-muted-foreground">Ranked by algorithm</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
              <span>{totalRecommendationsCount || 12}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          <div
            onClick={() => navigate('/saved-paths')}
            className="p-3 rounded-xl bg-muted/15 border border-border/60 hover:border-primary/40 hover:bg-muted/25 transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <Bookmark className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Saved Careers</p>
                <p className="text-[10px] text-muted-foreground">Shortlisted pathways</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
              <span>{savedCareersCount}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          <div
            onClick={() => navigate('/compare')}
            className="p-3 rounded-xl bg-muted/15 border border-border/60 hover:border-primary/40 hover:bg-muted/25 transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <GitCompare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Comparisons</p>
                <p className="text-[10px] text-muted-foreground">Side-by-side analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
              <span>{comparisonsCount}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
