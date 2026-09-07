import { useState } from 'react'
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function PathwayPreview() {
  const [selectedBranch, setSelectedBranch] = useState<'software' | 'data' | 'cyber' | 'product'>('data')

  const branchDetails = {
    software: {
      title: 'Software Development',
      badge: 'High Reversibility',
      reversibility: '92%',
      switchCost: 'Low',
      skills: ['Distributed Systems', 'Cloud Architecture', 'Web Engineering'],
      accentColor: 'text-primary border-primary/30 bg-primary/5',
    },
    data: {
      title: 'Data Science & AI',
      badge: 'Growing Demand',
      reversibility: '88%',
      switchCost: 'Low-Med',
      skills: ['Statistical Modeling', 'Machine Learning', 'Data Pipelines'],
      accentColor: 'text-accent border-accent/30 bg-accent/5',
    },
    cyber: {
      title: 'Cyber Security',
      badge: 'Specialized Track',
      reversibility: '76%',
      switchCost: 'Medium',
      skills: ['Network Defense', 'Cryptography', 'Penetration Testing'],
      accentColor: 'text-indigo-500 border-indigo-500/30 bg-indigo-500/5',
    },
    product: {
      title: 'Product & Tech Mgmt',
      badge: 'Cross-functional',
      reversibility: '85%',
      switchCost: 'Low',
      skills: ['Product Strategy', 'System Design', 'User Research'],
      accentColor: 'text-teal-500 border-teal-500/30 bg-teal-500/5',
    },
  }

  return (
    <div className="relative w-full rounded-2xl border border-border bg-card/95 p-6 md:p-8 shadow-lg shadow-primary/5 backdrop-blur-xs">
      {/* Background Decorative Graph Lines */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Top Floating Badge */}
      <div className="flex items-center justify-between pb-6 border-b border-border/70">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pathway Graph Preview
          </span>
        </div>
        <Badge variant="accent" className="text-[11px] gap-1 px-2.5 py-0.5">
          <Sparkles className="h-3 w-3" />
          Multiple Possibilities
        </Badge>
      </div>

      {/* Graph Visual Structure */}
      <div className="relative py-6">
        {/* Stage 1: Root Node */}
        <div className="flex justify-center">
          <div className="group relative flex items-center gap-2.5 rounded-xl border border-border bg-background px-4 py-2 shadow-xs transition-all hover:border-primary/50">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="text-left">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Starting Position</span>
              <p className="text-xs font-semibold text-foreground">Class 12 • Science (PCM)</p>
            </div>
          </div>
        </div>

        {/* SVG Connector 1 (Root to Degree Node) */}
        <div className="flex justify-center my-2">
          <svg width="24" height="32" viewBox="0 0 24 32" fill="none" className="text-border">
            <path d="M12 0V32" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="12" cy="16" r="3" fill="var(--primary)" />
          </svg>
        </div>

        {/* Stage 2: Central Active Degree Node */}
        <div className="flex justify-center">
          <div className="relative rounded-xl border-2 border-primary/80 bg-primary/10 dark:bg-primary/20 p-4 shadow-md glow-primary max-w-sm w-full transition-all">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                  Active Node
                </span>
                <h4 className="mt-1.5 text-sm font-bold text-foreground">
                  🎓 B.Tech Computer Science
                </h4>
                <p className="text-xs text-muted-foreground">
                  Degree • 4 Years • Engineering
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold text-accent dark:text-accent-foreground block">
                  Reversibility: 90%
                </span>
                <span className="text-[10px] text-muted-foreground">Switch Cost: Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Connector 2 (Degree Node branching to Career Nodes) */}
        <div className="my-3 w-full flex justify-center">
          <svg width="100%" height="40" viewBox="0 0 380 40" fill="none" className="max-w-md text-border">
            <path d="M190 0V15" stroke="currentColor" strokeWidth="2" />
            <path d="M48 15H332" stroke="currentColor" strokeWidth="2" />
            <path d="M48 15V40" stroke="currentColor" strokeWidth="2" />
            <path d="M142 15V40" stroke="currentColor" strokeWidth="2" />
            <path d="M238 15V40" stroke="currentColor" strokeWidth="2" />
            <path d="M332 15V40" stroke="currentColor" strokeWidth="2" />
            {/* Connection Dots */}
            <circle cx="48" cy="15" r="3" fill="var(--primary)" />
            <circle cx="142" cy="15" r="3" fill="var(--accent)" />
            <circle cx="238" cy="15" r="3" fill="var(--primary)" />
            <circle cx="332" cy="15" r="3" fill="var(--accent)" />
          </svg>
        </div>

        {/* Stage 3: Branching Career Opportunities (Clickable) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(['software', 'data', 'cyber', 'product'] as const).map((key) => {
            const item = branchDetails[key]
            const isSelected = selectedBranch === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedBranch(key)}
                className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                    : 'border-border bg-background/80 hover:border-border/80 hover:bg-muted/40'
                }`}
              >
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                  {key === 'software' ? 'Eng' : key === 'data' ? 'AI' : key === 'cyber' ? 'Sec' : 'Mgmt'}
                </span>
                <span className="text-xs font-semibold text-foreground mt-0.5 line-clamp-1">
                  {item.title}
                </span>
                <span className="mt-1 text-[10px] text-accent font-medium">
                  {item.reversibility} flex
                </span>
              </button>
            )
          })}
        </div>

        {/* Selected Branch Detail Mini-Card */}
        <div className="mt-4 rounded-xl border border-border/80 bg-background/60 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {branchDetails[selectedBranch].title}
              </span>
              <span className="rounded bg-accent/15 text-accent dark:text-accent-foreground px-1.5 py-0.2 text-[10px] font-semibold">
                {branchDetails[selectedBranch].badge}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-success" />
              Key focus: {branchDetails[selectedBranch].skills.join(', ')}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Switch Cost</span>
              <span className="font-medium text-foreground text-[11px]">
                {branchDetails[selectedBranch].switchCost}
              </span>
            </div>
            <div className="h-6 w-px bg-border mx-1" />
            <a
              href="#pathway-preview"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              Explore <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Subtext */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-accent" />
          Deterministic eligibility verification
        </span>
        <span className="font-medium text-foreground">1 of 12 branchings shown</span>
      </div>
    </div>
  )
}
