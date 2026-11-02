import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User as UserIcon,
  Sparkles,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * Top header controls for search, notification, and user profile dropdown.
 * Rendered in the top application navbar.
 */
export const DashboardHeaderControls: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: ⌘K or Ctrl+K focuses the search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Search Input with ⌘K Badge */}
      <div className="relative w-44 sm:w-64 md:w-72 lg:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search careers, courses, exams..."
          className="w-full pl-8 sm:pl-9 pr-10 sm:pr-12 py-1.5 sm:py-2 text-xs bg-muted/20 hover:bg-muted/30 focus:bg-card border border-border/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-semibold text-muted bg-muted/40 border border-border/70 rounded pointer-events-none">
          ⌘K
        </kbd>
      </div>

      {/* Notifications Button */}
      <button
        className="relative p-2 rounded-xl border border-border/70 bg-card hover:bg-muted/30 text-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
      </button>

      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors cursor-pointer text-left shrink-0"
            aria-label="User menu"
          >
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              {user?.display_name ? user.display_name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-foreground leading-tight truncate max-w-[110px]">
                {user?.display_name || 'Explorer'}
              </p>
            </div>
            <ChevronDown className="h-3 w-3 text-muted hidden sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-card border-border shadow-lg z-50">
          <div className="px-3 py-2 border-b border-border/60">
            <p className="text-xs font-bold text-foreground truncate">
              {user?.display_name || 'Student Explorer'}
            </p>
            <p className="text-[11px] text-muted truncate">
              {user?.email || 'student@forkora.com'}
            </p>
          </div>
          <DropdownMenuItem
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-xs cursor-pointer py-2"
          >
            <UserIcon className="h-3.5 w-3.5 text-muted" />
            <span>View Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-2 text-xs cursor-pointer py-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>Update Preferences</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-error cursor-pointer py-2"
          >
            <LogOut className="h-3.5 w-3.5 text-error" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = (props) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-1 text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
          <LayoutDashboard className="h-3 w-3" />
          <span>Student Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Welcome to <span className="text-primary font-black">Forkora</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-xl">
          Your centralized career exploration, assessment progress, and pathway planning hub.
        </p>
      </div>

      <DashboardHeaderControls {...props} />
    </div>
  );
};
