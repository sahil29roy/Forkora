import { Link } from 'react-router-dom'
import { GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ForkoraLogoProps {
  className?: string
  iconSize?: 'sm' | 'md' | 'lg'
  textSize?: 'sm' | 'md' | 'lg'
  showLink?: boolean
}

export function ForkoraLogo({
  className,
  iconSize = 'md',
  textSize = 'md',
  showLink = true,
}: ForkoraLogoProps) {
  const iconDimensions = {
    sm: 'h-7 w-7 rounded-lg',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-11 w-11 rounded-2xl',
  }[iconSize]

  const lucideSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[iconSize]

  const textDimensions = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[textSize]

  const content = (
    <div className={cn('flex items-center gap-2.5 group select-none', className)}>
      <div
        className={cn(
          'flex items-center justify-center bg-primary text-primary-foreground shadow-sm shadow-primary/25 transition-transform duration-200 group-hover:scale-105',
          iconDimensions
        )}
      >
        <GitBranch className={cn('rotate-90 stroke-[2.2]', lucideSizes)} />
      </div>
      <span
        className={cn(
          'font-extrabold tracking-tight text-foreground flex items-center gap-1',
          textDimensions
        )}
      >
        Forkora
        <span className="h-1.5 w-1.5 rounded-full bg-accent inline-block" />
      </span>
    </div>
  )

  if (showLink) {
    return (
      <Link to="/" className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
        {content}
      </Link>
    )
  }

  return content
}
