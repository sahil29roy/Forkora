import { useState } from 'react'
import { ArrowRight, Sliders, ChevronDown, Check, Shield, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type StreamType = 'science' | 'commerce' | 'humanities'
type InterestType = 'tech' | 'data' | 'business' | 'design'

export function SimulationPreview() {
  const [stage, setStage] = useState<string>('Class 12')
  const [stream, setStream] = useState<StreamType>('science')
  const [score, setScore] = useState<string>('87.4%')
  const [interest, setInterest] = useState<InterestType>('tech')

  const simulationData = {
    science: {
      primaryDegree: 'B.Tech / B.E. Computer Science',
      duration: '4 Years',
      reversibility: 'High (88%)',
      switchCost: 'Low',
      outcomes: [
        { role: 'Software Engineering', match: '94%', tag: 'High Growth' },
        { role: 'Data Science & ML', match: '89%', tag: 'Emerging' },
        { role: 'Product Management', match: '82%', tag: 'Versatile' },
        { role: 'Cyber Security Operations', match: '78%', tag: 'Specialized' },
      ],
      transitionAlert: 'Directly eligible for technical & mathematical graduate programs.',
    },
    commerce: {
      primaryDegree: 'B.Com (Hons) / BBA Finance & Analytics',
      duration: '3-4 Years',
      reversibility: 'Moderate-High (82%)',
      switchCost: 'Low-Med',
      outcomes: [
        { role: 'Financial Analysis & Valuation', match: '92%', tag: 'High Growth' },
        { role: 'Business Intelligence & Analytics', match: '86%', tag: 'Emerging' },
        { role: 'Consulting & Strategy', match: '84%', tag: 'Versatile' },
        { role: 'Corporate Treasury / Audit', match: '79%', tag: 'Specialized' },
      ],
      transitionAlert: 'Eligible for quantitative finance, MBA, and technology analytics pathways.',
    },
    humanities: {
      primaryDegree: 'B.A. Economics / Public Policy / Media',
      duration: '3-4 Years',
      reversibility: 'Moderate (75%)',
      switchCost: 'Medium',
      outcomes: [
        { role: 'UX Research & Product Design', match: '90%', tag: 'High Growth' },
        { role: 'Policy & Economic Consulting', match: '88%', tag: 'Specialized' },
        { role: 'Digital Media & Communications', match: '85%', tag: 'Versatile' },
        { role: 'Organizational Strategy', match: '80%', tag: 'Emerging' },
      ],
      transitionAlert: 'High flexibility into law, civil administration, design strategy, and management.',
    },
  }

  const currentData = simulationData[stream]

  return (
    <section id="simulation" className="relative py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <Sliders className="h-3.5 w-3.5" />
            Hypothetical Path Modeling
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            What if you choose differently?
          </h2>
          <p className="mt-3.5 text-base sm:text-lg text-muted-foreground">
            Explore how changing one decision can open different pathways without affecting your saved state.
          </p>
        </div>

        {/* Large UI Preview Card (SaaS Product Interface Look) */}
        <div className="rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
          
          {/* Top Window Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-destructive/60" />
              <span className="h-3 w-3 rounded-full bg-warning/60" />
              <span className="h-3 w-3 rounded-full bg-success/60" />
              <span className="ml-2 font-semibold text-foreground">Forkora Pathway Simulator</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>In-Memory Sandbox</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
            
            {/* Left Side: Scenario Inputs (5 Cols) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-foreground">
                    Scenario Parameters
                  </h3>
                  <Badge variant="outline" className="text-[11px]">Dynamic Config</Badge>
                </div>

                <p className="text-xs text-muted-foreground mb-6">
                  Adjust academic baseline parameters to see how deterministic transition rules evaluate downstream pathways.
                </p>

                {/* Controls */}
                <div className="space-y-4">
                  
                  {/* Current Stage */}
                  <div>
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                      Current Academic Stage
                    </label>
                    <div className="relative">
                      <select
                        value={stage}
                        onChange={(e) => setStage(e.target.value)}
                        className="w-full h-10 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                      >
                        <option value="Class 10">Class 10 (Secondary)</option>
                        <option value="Class 12">Class 12 (Higher Secondary)</option>
                        <option value="Undergraduate">Undergraduate (Year 1-2)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* Academic Stream */}
                  <div>
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                      Stream / Specialization
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'science', label: 'Science' },
                        { id: 'commerce', label: 'Commerce' },
                        { id: 'humanities', label: 'Humanities' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStream(item.id as StreamType)}
                          className={`h-9 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            stream === item.id
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                              : 'bg-background text-muted-foreground border-border hover:bg-muted/50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Performance */}
                  <div>
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                      Academic Score Benchmark
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="w-full h-10 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. 85%"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">Standardized</span>
                    </div>
                  </div>

                  {/* Primary Interest */}
                  <div>
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                      Target Domain Interest
                    </label>
                    <div className="relative">
                      <select
                        value={interest}
                        onChange={(e) => setInterest(e.target.value as InterestType)}
                        className="w-full h-10 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                      >
                        <option value="tech">Software & Applied Computing</option>
                        <option value="data">Data Science & Analytics</option>
                        <option value="business">Strategy, Finance & Management</option>
                        <option value="design">Design, Research & Policy</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl shadow-sm"
                  onClick={() => {}}
                >
                  Show Possible Paths
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  Simulation is ephemeral • Saved state remains untouched
                </p>
              </div>
            </div>

            {/* Right Side: Simulated Outcomes (7 Cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 bg-muted/10 flex flex-col justify-between space-y-6">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-accent tracking-wider">
                      Simulated Pathway Result
                    </span>
                    <h4 className="text-lg font-bold text-foreground mt-0.5">
                      {currentData.primaryDegree}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-primary block">
                      Reversibility: {currentData.reversibility}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Switch Cost: {currentData.switchCost}
                    </span>
                  </div>
                </div>

                {/* Outcome Cards */}
                <div className="mt-6 space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Downstream Specializations & Roles
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentData.outcomes.map((outcome) => (
                      <div
                        key={outcome.role}
                        className="p-3.5 rounded-xl border border-border bg-card/90 hover:border-primary/40 hover:shadow-xs transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-foreground line-clamp-1">
                            {outcome.role}
                          </span>
                          <span className="text-[10px] font-semibold rounded bg-primary/10 text-primary px-1.5 py-0.5">
                            {outcome.tag}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3 text-success" /> Pathway Alignment
                          </span>
                          <span className="font-semibold text-foreground">{outcome.match}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deterministic Verification Box */}
                <div className="mt-6 rounded-xl border border-border bg-card/60 p-4 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-foreground block mb-0.5">
                      Eligibility & Prerequisite Evaluation
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {currentData.transitionAlert}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Notification */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-primary" />
                  No Black-box ML prediction • Rule-based validity
                </span>
                <span className="font-medium text-foreground">Interactive Demo</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
