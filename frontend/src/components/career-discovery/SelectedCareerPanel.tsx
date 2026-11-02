import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Bookmark,
  GitCompare,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillRadarChart } from './SkillRadarChart';
import { SuggestedPathwayPreview } from './SuggestedPathwayPreview';
import type { CareerRecommendationItem } from '@/types/career.types';

interface SelectedCareerPanelProps {
  career: CareerRecommendationItem;
  isSaved: boolean;
  onToggleSave: () => void;
  onOpenCompare: () => void;
  className?: string;
}

type TabType = 'overview' | 'pathway' | 'eligibility' | 'skills' | 'insights';

export const SelectedCareerPanel: React.FC<SelectedCareerPanelProps> = ({
  career,
  isSaved,
  onToggleSave,
  onOpenCompare,
  className = '',
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

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

  const Icon = getCareerIcon(career.career_code);

  const getMatchTier = (score: number) => {
    if (score >= 80) return { label: 'High Match', color: 'text-primary bg-primary/10 border-primary/20' };
    if (score >= 70) return { label: 'Good Match', color: 'text-accent bg-accent/10 border-accent/20' };
    return { label: 'Moderate Match', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' };
  };

  const matchTier = getMatchTier(career.compatibilityScore);

  // Eligibility Status mapping
  const getEligibilityBadge = (status: string) => {
    switch (status) {
      case 'eligible':
        return {
          label: 'Eligible',
          icon: CheckCircle2,
          color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
          desc: 'You satisfy all primary academic requirements and prerequisites for this career pathway.',
        };
      case 'conditionally_eligible':
        return {
          label: 'Conditionally Eligible',
          icon: AlertCircle,
          color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
          desc: 'You can qualify by completing specific prerequisites, stream selections, or entrance exams.',
        };
      case 'not_eligible':
        return {
          label: 'Not Eligible',
          icon: AlertCircle,
          color: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
          desc: 'Current enrolled stream or coursework does not meet mandatory prerequisites for this pathway.',
        };
      default:
        return {
          label: 'Verification Required',
          icon: HelpCircle,
          color: 'text-muted-foreground bg-muted/30 border-border',
          desc: 'Prerequisites require additional profile or institutional verification.',
        };
    }
  };

  const eligibilityBadge = getEligibilityBadge(career.eligibility);

  // Salary formatting
  const formatSalary = (salary?: { min: number; max: number; median: number }) => {
    if (!salary || (!salary.min && !salary.max)) {
      return { range: '₹6.0L - ₹30.0L/yr', median: '₹14.0L/yr' };
    }
    const toLakhs = (val: number) => `₹${(val / 100000).toFixed(1)}L`;
    return {
      range: `${toLakhs(salary.min)} - ${toLakhs(salary.max)}/yr`,
      median: `${toLakhs(salary.median)}/yr`,
    };
  };

  const salaryInfo = formatSalary(career.salary_range_inr);

  return (
    <div
      className={`p-6 rounded-2xl bg-card border border-border shadow-2xs flex flex-col justify-between text-left space-y-6 ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs shrink-0">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {career.career}
            </h2>
            <p className="text-xs text-muted-foreground">
              {career.domain || 'Technology · Engineering · Development'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-left sm:text-right">
            <span className="text-xl sm:text-2xl font-black text-primary">
              {career.compatibilityScore}%
            </span>
            <p className="text-[11px] font-semibold text-muted-foreground">Compatibility Score</p>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${matchTier.color}`}>
            {matchTier.label}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/25 border border-border/60 overflow-x-auto select-none">
        {(['overview', 'pathway', 'eligibility', 'skills', 'insights'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[75px] py-1.5 px-3 rounded-lg text-xs font-semibold capitalize transition-all duration-150 cursor-pointer text-center ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="space-y-6 min-h-[300px]">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* About this Career */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                About this Career
              </h4>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                {career.description ||
                  'Architects, designs, and builds scalable computational systems, digital platforms, and software solutions addressing real-world user challenges.'}
              </p>
            </div>

            {/* Why it Matches You */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Why it Matches You
              </h4>
              <div className="space-y-2">
                {career.reasons && career.reasons.length > 0 ? (
                  career.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>Strong alignment across your academic grades and cognitive test performance.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold mb-1">
                  <DollarSign className="h-3.5 w-3.5 text-primary" />
                  <span>Salary Range</span>
                </div>
                <p className="text-sm font-bold text-foreground">{salaryInfo.range}</p>
                <p className="text-[10px] text-muted-foreground">Median: {salaryInfo.median}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold mb-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Typical Duration</span>
                </div>
                <p className="text-sm font-bold text-foreground">
                  {career.pathways?.[0]?.total_duration_months
                    ? `${Math.round(career.pathways[0].total_duration_months / 12)} Years`
                    : '3 - 4 Years'}
                </p>
                <p className="text-[10px] text-muted-foreground">Undergraduate degree route</p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span>Market Demand</span>
                </div>
                <p className="text-sm font-bold text-accent">High Growth</p>
                <p className="text-[10px] text-muted-foreground">Top national hiring sector</p>
              </div>
            </div>

            {/* Skill Alignment & Suggested Pathway Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-muted/15 border border-border/60 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Skill Alignment
                  </h4>
                  <span className="text-[10px] font-semibold text-primary">Multi-dimensional</span>
                </div>
                <SkillRadarChart />
              </div>

              <SuggestedPathwayPreview
                careerTitle={career.career}
                careerCode={career.career_code}
                pathways={career.pathways}
              />
            </div>
          </div>
        )}

        {/* TAB 2: PATHWAY */}
        {activeTab === 'pathway' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">Verified Education & Career Pathways</h4>
                <p className="text-xs text-muted-foreground">
                  Graph routes connecting your current education level to {career.career}.
                </p>
              </div>
              <Button
                onClick={() => navigate(`/career-graph?career=${encodeURIComponent(career.career_code)}`)}
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs rounded-xl"
              >
                <GitBranch className="h-3.5 w-3.5 text-primary" />
                <span>Explore in Full Graph</span>
              </Button>
            </div>

            <div className="space-y-3">
              {career.pathways && career.pathways.length > 0 ? (
                career.pathways.map((path, idx) => (
                  <div
                    key={path.pathway_id || idx}
                    className="p-4 rounded-xl bg-card border border-border/70 hover:border-primary/40 transition-colors space-y-3 text-left shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">
                        {path.title || `Pathway ${idx + 1}`}
                      </span>
                      {path.total_duration_months ? (
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Duration: ~{Math.round(path.total_duration_months / 12)} years
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {path.nodes.map((node, nodeIdx) => (
                        <React.Fragment key={`${node}-${nodeIdx}`}>
                          <span
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                              nodeIdx === path.nodes.length - 1
                                ? 'bg-primary/10 text-primary border-primary/30 font-bold'
                                : 'bg-muted/30 text-foreground border-border/70'
                            }`}
                          >
                            {node}
                          </span>
                          {nodeIdx < path.nodes.length - 1 && (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Loading verified pathways from graph...
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ELIGIBILITY */}
        {activeTab === 'eligibility' && (
          <div className="space-y-5 animate-fade-in">
            {/* Status Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${eligibilityBadge.color}`}>
              <eligibilityBadge.icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">{eligibilityBadge.label}</h4>
                <p className="text-xs leading-relaxed opacity-90">{eligibilityBadge.desc}</p>
              </div>
            </div>

            {/* Explanations & Prerequisites */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Prerequisite Evaluation Details
              </h4>
              <div className="space-y-2">
                {career.reasons && career.reasons.length > 0 ? (
                  career.reasons.map((r, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-card border border-border/60 text-xs sm:text-sm text-foreground flex items-center gap-2.5 shadow-2xs"
                    >
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-card border border-border/60 text-xs text-muted-foreground">
                    Meets core academic requirements based on stream selection.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h4 className="text-sm font-bold text-foreground">Core Competencies & Career Skills</h4>
              <p className="text-xs text-muted-foreground">
                Essential skills required for high performance in {career.career}.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Technical & Domain Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {(career.skills && career.skills.length > 0
                    ? career.skills
                    : ['Software Architecture', 'Full Stack Development', 'Problem Solving', 'Cloud Computing']
                  ).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Analytical & Cognitive Strengths
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Critical Thinking', 'Algorithmic Logic', 'Data Modeling', 'Continuous Learning'].map(
                    (skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-foreground shadow-2xs"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h4 className="text-sm font-bold text-foreground">Compatibility Breakdown</h4>
              <p className="text-xs text-muted-foreground">
                Detailed multi-component scoring contributing to your {career.compatibilityScore}% compatibility score.
              </p>
            </div>

            {career.breakdown ? (
              <div className="space-y-3">
                {[
                  { label: 'Academic Coursework Alignment', val: career.breakdown.academic_score, weight: '15-25%' },
                  { label: 'Aptitude & Problem-Solving', val: career.breakdown.aptitude_score, weight: '12-20%' },
                  { label: 'Behavioural Dimension Alignment', val: career.breakdown.behavioural_score, weight: '13-20%' },
                  { label: 'Situational Judgment & Decision-Making', val: career.breakdown.situational_score, weight: '10%' },
                  { label: 'Student Preferences & Interests', val: career.breakdown.preferences_score, weight: '10%' },
                  { label: 'Historical Trajectory Baseline', val: career.breakdown.ml_score, weight: '25-30%' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-card border border-border/60 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-semibold">Weight: {item.weight}</span>
                        <span className="font-bold text-primary">{item.val}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${item.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Breakdown details calculated server-side.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Button
            onClick={onToggleSave}
            variant={isSaved ? 'secondary' : 'outline'}
            size="sm"
            className="gap-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
            <span>{isSaved ? 'Saved' : 'Save Career'}</span>
          </Button>

          <Button
            onClick={onOpenCompare}
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <GitCompare className="h-3.5 w-3.5 text-primary" />
            <span>Compare with Another</span>
          </Button>
        </div>

        <Button
          onClick={() => navigate(`/career-graph?career=${encodeURIComponent(career.career_code)}`)}
          size="sm"
          className="gap-2 rounded-xl text-xs bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs cursor-pointer"
        >
          <span>Explore in Career Graph</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
