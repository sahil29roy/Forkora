import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  GitBranch,
  Bookmark,
  GitCompare,
  User,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { ForkoraLogo } from '@/components/brand/ForkoraLogo'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/components/theme/ThemeProvider'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  onItemClick?: () => void
  className?: string
}

export function AppSidebar({ onItemClick, className }: AppSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  const mainNavItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      isActive: location.pathname === '/dashboard',
    },
    {
      title: 'Assessments',
      href: '/assessments',
      icon: BrainCircuit,
      isActive:
        location.pathname === '/assessments' ||
        location.pathname.startsWith('/assessment'),
    },
    {
      title: 'Career Discovery',
      href: '/career-discovery',
      icon: Compass,
      isActive:
        location.pathname === '/career-discovery' ||
        location.pathname === '/career-exploration',
    },
    {
      title: 'Career Graph',
      href: '/career-graph',
      icon: GitBranch,
      isActive: location.pathname === '/career-graph',
    },
    {
      title: 'Saved Paths',
      href: '/saved-paths',
      icon: Bookmark,
      isActive: location.pathname === '/saved-paths',
    },
    {
      title: 'Compare',
      href: '/compare',
      icon: GitCompare,
      isActive:
        location.pathname === '/compare' ||
        location.pathname === '/compare-paths',
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: User,
      isActive: location.pathname === '/profile',
    },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'w-64 h-full bg-card border-r border-border/80 flex flex-col justify-between select-none transition-colors duration-200',
        className
      )}
    >
      {/* Top Header with Brand Logo */}
      <div>
        <div className="h-16 md:h-18 px-6 flex items-center border-b border-border/60">
          <ForkoraLogo iconSize="sm" textSize="md" />
        </div>

        {/* Primary Navigation Links */}
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Navigation
            </span>
            <nav className="space-y-1 pt-1.5" aria-label="Main Navigation">
              {mainNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={onItemClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150',
                      item.isActive
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs shadow-primary/10'
                        : 'text-muted hover:text-foreground hover:bg-muted/30 border border-transparent'
                    )}
                    aria-current={item.isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        item.isActive ? 'text-primary' : 'text-muted'
                      )}
                    />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Section: User Profile & Theme Switcher */}
      <div className="p-4 border-t border-border/60 space-y-3">
        {/* User Card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {user?.display_name
                ? user.display_name.charAt(0).toUpperCase()
                : 'U'}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-bold text-foreground truncate">
                {user?.display_name || 'Student Explorer'}
              </p>
              <p className="text-[10px] text-muted truncate">
                {user?.email || 'student@forkora.com'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="text-muted hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error/10 cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Theme Switcher Segmented Control */}
        <div className="flex items-center justify-between p-1 rounded-xl bg-muted/30 border border-border/60 text-xs">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all duration-150 cursor-pointer',
              theme === 'light'
                ? 'bg-card text-foreground shadow-xs border border-border/60 font-semibold'
                : 'text-muted hover:text-foreground'
            )}
            title="Light Theme"
          >
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[11px]">Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all duration-150 cursor-pointer',
              theme === 'dark'
                ? 'bg-card text-foreground shadow-xs border border-border/60 font-semibold'
                : 'text-muted hover:text-foreground'
            )}
            title="Dark Theme"
          >
            <Moon className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-[11px]">Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all duration-150 cursor-pointer',
              theme === 'system'
                ? 'bg-card text-foreground shadow-xs border border-border/60 font-semibold'
                : 'text-muted hover:text-foreground'
            )}
            title="System Theme"
          >
            <Monitor className="h-3.5 w-3.5 text-muted" />
            <span className="text-[11px]">Auto</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
