import React from 'react';
import { Sparkles, Edit3 } from 'lucide-react';

interface CareerProfileCardProps {
  traits: string[];
  interests?: string[];
  workEnvironment?: string;
  onEdit: () => void;
  className?: string;
}

export const CareerProfileCard: React.FC<CareerProfileCardProps> = ({
  traits,
  interests = [],
  workEnvironment,
  onEdit,
  className = '',
}) => {
  // Combine traits and interests into clean chips
  const allChips = Array.from(new Set([...traits, ...interests.slice(0, 3)]));

  return (
    <div
      className={`p-5 rounded-2xl bg-card border border-border shadow-2xs flex flex-col justify-between text-left space-y-4 ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            Your Career Profile
          </h3>
        </div>
        <button
          onClick={onEdit}
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Edit3 className="h-3 w-3" />
          <span>Edit</span>
        </button>
      </div>

      {/* Profile Traits Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {allChips.map((trait, idx) => (
          <span
            key={`${trait}-${idx}`}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-foreground hover:border-primary/40 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary/70 shrink-0" />
            <span className="truncate max-w-[200px]">{trait}</span>
          </span>
        ))}

        {workEnvironment && workEnvironment !== 'No preference' && (
          <span className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary/[0.06] text-primary border border-primary/20 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
            <span>{workEnvironment}</span>
          </span>
        )}
      </div>
    </div>
  );
};
