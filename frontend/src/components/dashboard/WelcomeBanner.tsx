import React from 'react';
import { ArrowRight, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeBannerProps {
  userName: string;
  studentLevel: string;
  studentStream: string | null;
  profileCompletion: number;
  primaryCtaText: string;
  onPrimaryCtaClick: () => void;
  className?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName,
  studentLevel,
  studentStream,
  profileCompletion,
  primaryCtaText,
  onPrimaryCtaClick,
  className = '',
}) => {
  const displayStreamLabel = studentStream
    ? `${studentLevel} · ${studentStream}`
    : `${studentLevel} · General Stream`;

  return (
    <div
      className={`relative overflow-hidden p-6 sm:p-7 rounded-2xl bg-primary/[0.04] dark:bg-primary/[0.08] border border-primary/20 flex flex-col md:flex-row md:items-center md:justify-between gap-5 transition-colors ${className}`}
    >
      {/* Background subtle lavender glow */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Left Details */}
      <div className="space-y-3 z-10 text-left">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Welcome back, <span className="text-primary">{userName || 'Student'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            Continue exploring your academic and career possibilities.
          </p>
        </div>

        {/* Academic Level & Profile Completion Pill Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border shadow-2xs text-xs font-semibold text-foreground">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span>{displayStreamLabel}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border shadow-2xs text-xs font-medium text-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
            <span>Profile: <strong>{profileCompletion}% Complete</strong></span>
            <div className="w-16 h-1.5 rounded-full bg-muted/30 overflow-hidden hidden sm:block">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Primary Dynamic Action */}
      <div className="z-10 shrink-0">
        <Button
          onClick={onPrimaryCtaClick}
          className="w-full sm:w-auto gap-2 rounded-xl text-xs sm:text-sm bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-md shadow-primary/20 py-2.5 px-5 cursor-pointer transition-all duration-150"
        >
          <span>{primaryCtaText}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
