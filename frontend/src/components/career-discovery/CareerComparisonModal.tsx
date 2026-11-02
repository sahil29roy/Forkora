import React, { useState } from 'react';
import {
  X,
  GitCompare,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CareerRecommendationItem } from '@/types/career.types';

interface CareerComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseCareer: CareerRecommendationItem;
  allCareers: CareerRecommendationItem[];
}

export const CareerComparisonModal: React.FC<CareerComparisonModalProps> = ({
  isOpen,
  onClose,
  baseCareer,
  allCareers,
}) => {
  const otherCareers = allCareers.filter((c) => c.career_code !== baseCareer.career_code);
  const [selectedCompareCode, setSelectedCompareCode] = useState<string>(
    otherCareers[0]?.career_code || ''
  );

  if (!isOpen) return null;

  const compareCareer =
    allCareers.find((c) => c.career_code === selectedCompareCode) || otherCareers[0];

  const formatSalary = (salary?: { min: number; max: number; median: number }) => {
    if (!salary || (!salary.min && !salary.max)) return '₹6.0L - ₹30.0L/yr';
    return `₹${(salary.min / 100000).toFixed(1)}L - ₹${(salary.max / 100000).toFixed(1)}L/yr`;
  };

  const getEligibilityLabel = (status: string) => {
    switch (status) {
      case 'eligible':
        return { label: 'Eligible', color: 'text-emerald-600 bg-emerald-500/10' };
      case 'conditionally_eligible':
        return { label: 'Conditionally Eligible', color: 'text-amber-600 bg-amber-500/10' };
      case 'not_eligible':
        return { label: 'Not Eligible', color: 'text-rose-600 bg-rose-500/10' };
      default:
        return { label: 'Pending Verification', color: 'text-muted-foreground bg-muted/30' };
    }
  };

  const baseElig = getEligibilityLabel(baseCareer.eligibility);
  const compElig = compareCareer ? getEligibilityLabel(compareCareer.eligibility) : null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-6 text-left animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Compare Careers</h3>
              <p className="text-xs text-muted-foreground">
                Side-by-side analysis of compatibility, education requirements, and outcomes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Compare Target Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">Compare with:</span>
          <select
            value={selectedCompareCode}
            onChange={(e) => setSelectedCompareCode(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted/20 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {otherCareers.map((c) => (
              <option key={c.career_code} value={c.career_code}>
                {c.career} ({c.compatibilityScore}%)
              </option>
            ))}
          </select>
        </div>

        {/* Comparison Table */}
        {compareCareer && (
          <div className="rounded-xl border border-border/70 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/30 border-b border-border/60">
                  <th className="py-3 px-4 font-bold text-muted-foreground uppercase text-[10px] w-1/3">
                    Attribute
                  </th>
                  <th className="py-3 px-4 font-bold text-primary w-1/3">
                    {baseCareer.career} (Current)
                  </th>
                  <th className="py-3 px-4 font-bold text-foreground w-1/3">
                    {compareCareer.career}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">Compatibility Score</td>
                  <td className="py-3 px-4 font-extrabold text-primary text-sm">
                    {baseCareer.compatibilityScore}%
                  </td>
                  <td className="py-3 px-4 font-extrabold text-foreground text-sm">
                    {compareCareer.compatibilityScore}%
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">Eligibility Status</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${baseElig.color}`}>
                      {baseElig.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {compElig && (
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${compElig.color}`}>
                        {compElig.label}
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">Average Salary Range</td>
                  <td className="py-3 px-4 font-medium text-foreground">{formatSalary(baseCareer.salary_range_inr)}</td>
                  <td className="py-3 px-4 font-medium text-foreground">{formatSalary(compareCareer.salary_range_inr)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">Typical Degree Duration</td>
                  <td className="py-3 px-4 font-medium text-foreground">
                    {baseCareer.pathways?.[0]?.total_duration_months
                      ? `${Math.round(baseCareer.pathways[0].total_duration_months / 12)} Years`
                      : '3 - 4 Years'}
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">
                    {compareCareer.pathways?.[0]?.total_duration_months
                      ? `${Math.round(compareCareer.pathways[0].total_duration_months / 12)} Years`
                      : '3 - 4 Years'}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">Core Skills</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(baseCareer.skills || ['Analytical', 'Problem Solving']).slice(0, 3).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-muted/40 text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(compareCareer.skills || ['Analytical', 'Problem Solving']).slice(0, 3).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-muted/40 text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <Button onClick={onClose} size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  );
};
