import { Link } from 'react-router-dom'
import { ForkoraLogo } from '@/components/brand/ForkoraLogo'
import { Button } from '@/components/ui/button'
import { ThemeSelector } from './ThemeSelector'

interface AuthHeaderProps {
  type: 'login' | 'signup'
}

export function AuthHeader({ type }: AuthHeaderProps) {
  const isLogin = type === 'login'

  return (
    <header className="w-full flex items-center justify-between px-6 py-5 lg:px-12 lg:py-6 select-none">
      {/* Brand Logo */}
      <ForkoraLogo />

      {/* Right Controls: Switch Link + Theme Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 px-4 rounded-lg font-medium text-xs sm:text-sm border-border bg-card hover:bg-muted/50 text-foreground transition-all duration-150 shadow-xs"
        >
          <Link to={isLogin ? '/signup' : '/login'}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </Link>
        </Button>

        {/* Theme Selector */}
        <ThemeSelector />
      </div>
    </header>
  )
}
