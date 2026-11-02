import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, Target, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProfileSummaryCardProps {
  studentName: string;
  studentLevel: string;
  studentStream: string | null;
  profileCompletion: number;
  interests: string[];
  goal: string;
  careerPreferences: string[];
  className?: string;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  studentName,
  studentLevel,
  studentStream,
  profileCompletion,
  interests,
  goal,
  careerPreferences,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`p-6 rounded-2xl bg-card border border-border shadow-2xs text-left space-y-4 flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
          Your Profile
        </h3>
        <button
          onClick={() => navigate('/profile')}
          className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View Profile</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Student Identity Snippet */}
      <div className="flex items-center gap-3.5">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
          {studentName ? studentName.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
        </div>
        <div className="min-w-0">
          <h4 className="text-base font-bold text-foreground truncate">{studentName || 'Student'}</h4>
          <p className="text-xs text-muted-foreground truncate">
            {studentStream ? `${studentLevel} · ${studentStream}` : studentLevel}
          </p>
        </div>
      </div>

      {/* Goal */}
      <div className="space-y-1 p-3 rounded-xl bg-muted/15 border border-border/50">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
          <Target className="h-3.5 w-3.5" />
          <span>Aspiration</span>
        </div>
        <p className="text-xs text-foreground/90 font-medium leading-relaxed">
          {goal || 'Explore software engineering and data analytics pathways.'}
        </p>
      </div>

      {/* Interests Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Areas of Interest
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(interests && interests.length > 0 ? interests : ['Technology', 'Problem-Solving', 'Mathematics']).map(
            (interest, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-card border border-border text-foreground shadow-2xs"
              >
                {interest}
              </span>
            )
          )}
        </div>
      </div>

      {/* Preferences Chips */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Preferred Careers
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(careerPreferences && careerPreferences.length > 0
            ? careerPreferences
            : ['Software Engineer', 'Data Scientist']
          ).map((pref, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5"
            >
              <Sparkles className="h-3 w-3" />
              <span>{pref}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
