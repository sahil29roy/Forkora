import { Info, Clock, CheckSquare, HeartHandshake, ShieldCheck } from 'lucide-react'

export function BeforeYouStartCard() {
  const guidelines = [
    {
      text: 'Complete each assessment at your own pace.',
      icon: Clock,
    },
    {
      text: 'Read each question carefully before responding.',
      icon: CheckSquare,
    },
    {
      text: 'Answer honestly based on your own preferences and experiences.',
      icon: HeartHandshake,
    },
    {
      text: 'Your responses help build a better understanding of your personal profile.',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span>Before You Start</span>
        </h3>
      </div>

      {/* Scannable Bullet Points */}
      <ul className="space-y-3 pt-1">
        {guidelines.map((item, idx) => {
          const Icon = item.icon
          return (
            <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5 border border-primary/20">
                <Icon className="h-3 w-3" />
              </span>
              <span className="text-muted font-medium">{item.text}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
