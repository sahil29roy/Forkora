import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User as UserIcon,
  Sparkles,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CareerDiscoveryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenPreferences?: () => void;
}

export const CareerDiscoveryHeader: React.FC<CareerDiscoveryHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenPreferences,
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
    <header className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Page Title & Hierarchy */}
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="h-3 w-3" />
            <span>Career Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Discover Your <span className="text-primary font-black">Career Path</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Get personalized career recommendations based on your academic profile, assessments and interests.
          </p>
        </div>

        {/* Right Controls: Search bar & User Profile */}
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          {/* Search Input with ⌘K Badge */}
          <div className="relative flex-1 md:w-72 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search careers, courses, exams..."
              className="w-full pl-9 pr-12 py-2 text-xs sm:text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground bg-muted/40 border border-border rounded-md pointer-events-none">
              ⌘K
            </kbd>
          </div>

          {/* Notifications Button */}
          <button
            className="relative p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors cursor-pointer shrink-0"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer text-left shrink-0"
                aria-label="User menu"
              >
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {user?.display_name ? user.display_name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-foreground leading-tight truncate max-w-[100px]">
                    {user?.display_name || 'Explorer'}
                  </p>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card border-border shadow-lg z-50">
              <div className="px-3 py-2 border-b border-border/60">
                <p className="text-xs font-bold text-foreground truncate">
                  {user?.display_name || 'Student Explorer'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email || 'student@forkora.com'}
                </p>
              </div>
              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-xs cursor-pointer py-2"
              >
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onOpenPreferences || (() => navigate('/onboarding'))}
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
      </div>
    </header>
  );
};
