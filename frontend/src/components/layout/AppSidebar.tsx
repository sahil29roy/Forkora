import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  Bookmark,
  GitCompare,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { ForkoraLogo } from '@/components/brand/ForkoraLogo'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  onItemClick?: () => void
  className?: string
}

export function AppSidebar({ onItemClick, className }: AppSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

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
      title: 'Career Exploration',
      href: '/career-exploration',
      icon: Compass,
      isActive: location.pathname === '/career-exploration',
    },
    {
      title: 'Saved Paths',
      href: '/saved-paths',
      icon: Bookmark,
      isActive: location.pathname === '/saved-paths',
    },
    {
      title: 'Compare Paths',
      href: '/compare-paths',
      icon: GitCompare,
      isActive: location.pathname === '/compare-paths',
    },
  ]

  const secondaryNavItems = [
    {
      title: 'Profile',
      href: '/profile',
      icon: User,
      isActive: location.pathname === '/profile',
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
      isActive: location.pathname === '/settings',
    },
    {
      title: 'Help',
      href: '/help',
      icon: HelpCircle,
      isActive: location.pathname === '/help',
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
        <div className="p-4 space-y-6">
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Overview
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

          {/* Secondary Navigation Links */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Account
            </span>
            <nav className="space-y-1 pt-1.5" aria-label="Account Navigation">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={onItemClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150',
                      item.isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted hover:text-foreground hover:bg-muted/30 border border-transparent'
                    )}
                    aria-current={item.isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom User Profile & Sign Out snippet */}
      <div className="p-4 border-t border-border/60">
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
      </div>
    </aside>
  )
}
