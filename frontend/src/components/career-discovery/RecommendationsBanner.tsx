import React from 'react';
import { Sparkles, SlidersHorizontal, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecommendationsBannerProps {
  studentLevel?: string;
  studentStream?: string | null;
  onUpdatePreferences: () => void;
  className?: string;
}

export const RecommendationsBanner: React.FC<RecommendationsBannerProps> = ({
  studentLevel = 'Class 12',
  studentStream = 'Science (PCM)',
  onUpdatePreferences,
  className = '',
}) => {
  const displayLabel = studentStream
    ? `${studentLevel} · ${studentStream}`
    : `${studentLevel} · General Stream`;

  return (
    <div
      className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-primary/[0.04] dark:bg-primary/[0.08] border border-primary/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors ${className}`}
    >
      {/* Background soft subtle decorative gradient highlight */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Left Text */}
      <div className="space-y-1 z-10 text-left">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            Personalized Career Recommendations
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
          A data-driven exploration of careers that align with your strengths, interests and goals.
        </p>
      </div>

      {/* Right Controls: Academic Level Pill & Update Preferences Button */}
      <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border shadow-2xs text-xs font-semibold text-foreground">
          <GraduationCap className="h-3.5 w-3.5 text-primary" />
          <span>{displayLabel}</span>
        </div>

        <Button
          onClick={onUpdatePreferences}
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl text-xs bg-card hover:bg-muted/40 font-semibold border-primary/30 text-primary hover:text-primary-hover shadow-2xs cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span>Update Preferences</span>
        </Button>
      </div>
    </div>
  );
};
