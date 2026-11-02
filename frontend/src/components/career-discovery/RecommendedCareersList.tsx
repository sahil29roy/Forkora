import React, { useState } from 'react';
import {
  Code,
  Database,
  Shield,
  Stethoscope,
  Briefcase,
  Scale,
  Palette,
  Landmark,
  UserCheck,
  TrendingUp,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { CareerRecommendationItem } from '@/types/career.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RecommendedCareersListProps {
  careers: CareerRecommendationItem[];
  selectedCareerCode: string;
  onSelectCareer: (career: CareerRecommendationItem) => void;
  className?: string;
}

export const RecommendedCareersList: React.FC<RecommendedCareersListProps> = ({
  careers,
  selectedCareerCode,
  onSelectCareer,
  className = '',
}) => {
  const [filterMatchLevel, setFilterMatchLevel] = useState<'ALL' | 'HIGH' | 'GOOD'>('ALL');
  const [showAll, setShowAll] = useState(false);

  // Helper to resolve career icon
  const getCareerIcon = (code: string) => {
    const c = code.toUpperCase();
    if (c.includes('SOFTWARE')) return Code;
    if (c.includes('DATA')) return Database;
    if (c.includes('CYBER') || c.includes('SECURITY')) return Shield;
    if (c.includes('DOCTOR') || c.includes('BIOTECH')) return Stethoscope;
    if (c.includes('ACCOUNTANT') || c.includes('BANKER')) return Landmark;
    if (c.includes('LAWYER')) return Scale;
    if (c.includes('DESIGNER')) return Palette;
    if (c.includes('CIVIL_SERVANT')) return UserCheck;
    if (c.includes('PRODUCT_MANAGER')) return TrendingUp;
    return Briefcase;
  };

  // Helper for match tier label and color
  const getMatchTier = (score: number) => {
    if (score >= 80) return { label: 'High Match', color: 'text-primary bg-primary/10 border-primary/20' };
    if (score >= 70) return { label: 'Good Match', color: 'text-accent bg-accent/10 border-accent/20' };
    return { label: 'Moderate Match', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' };
  };

  // Filter list
  const filteredCareers = careers.filter((item) => {
    if (filterMatchLevel === 'HIGH') return item.compatibilityScore >= 80;
    if (filterMatchLevel === 'GOOD') return item.compatibilityScore >= 70 && item.compatibilityScore < 80;
    return true;
  });

  const visibleCareers = showAll ? filteredCareers : filteredCareers.slice(0, 6);

  return (
    <div className={`p-5 rounded-2xl bg-card border border-border shadow-2xs flex flex-col justify-between text-left space-y-4 ${className}`}>
      {/* Header with Count & Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Recommended Careers
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-muted/30 text-muted-foreground border border-border/50">
            {careers.length}
          </span>
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
              aria-label="Filter recommendations"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{filterMatchLevel === 'ALL' ? 'Filters' : `${filterMatchLevel} Match`}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-card border-border shadow-lg z-50">
            <DropdownMenuItem
              onClick={() => setFilterMatchLevel('ALL')}
              className={`text-xs cursor-pointer ${filterMatchLevel === 'ALL' ? 'font-bold text-primary' : ''}`}
            >
              All Match Levels
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterMatchLevel('HIGH')}
              className={`text-xs cursor-pointer ${filterMatchLevel === 'HIGH' ? 'font-bold text-primary' : ''}`}
            >
              High Match (≥ 80%)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterMatchLevel('GOOD')}
              className={`text-xs cursor-pointer ${filterMatchLevel === 'GOOD' ? 'font-bold text-primary' : ''}`}
            >
              Good Match (70 - 79%)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards List */}
      <div className="space-y-2.5">
        {visibleCareers.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No careers match the selected filter.
          </div>
        ) : (
          visibleCareers.map((item, idx) => {
            const Icon = getCareerIcon(item.career_code);
            const isSelected = item.career_code === selectedCareerCode;
            const matchTier = getMatchTier(item.compatibilityScore);
            const rank = idx + 1;

            return (
              <div
                key={item.career_code}
                onClick={() => onSelectCareer(item)}
                className={`group p-3.5 rounded-xl border transition-all duration-150 cursor-pointer text-left flex flex-col gap-2.5 ${
                  isSelected
                    ? 'bg-primary/[0.06] dark:bg-primary/[0.12] border-primary shadow-xs ring-1 ring-primary/20'
                    : 'bg-card border-border hover:border-border/80 hover:bg-muted/15'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      {rank}
                    </span>

                    {/* Career Icon */}
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-2xs'
                          : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    {/* Title & Domain */}
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.career}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.domain || 'Technology · Engineering · Development'}
                      </p>
                    </div>
                  </div>

                  {/* Score & Match Pill */}
                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-extrabold text-foreground">
                      {item.compatibilityScore}%
                    </span>
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${matchTier.color}`}>
                        {matchTier.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compatibility Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSelected ? 'bg-primary' : 'bg-primary/70 group-hover:bg-primary'
                    }`}
                    style={{ width: `${item.compatibilityScore}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View All Toggle Button */}
      {filteredCareers.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2.5 rounded-xl border border-dashed border-border hover:border-primary/50 text-xs font-semibold text-primary hover:bg-primary/[0.04] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{showAll ? 'Show Fewer Careers' : `View All Recommended Careers (${careers.length})`}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
