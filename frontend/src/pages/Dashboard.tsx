import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { onboardingService } from '@/services/onboarding.service';
import { assessmentService } from '@/services/assessment.service';
import { careerService } from '@/services/career.service';
import type { ModuleProgressDTO } from '@/types/assessment.types';
import type {
  CareerRecommendationItem,
  CareerRecommendationsResponse,
  CareerPreferencesData,
} from '@/types/career.types';
import type { JourneyStage, RecentActivityItem } from '@/types/dashboard.types';

// Dashboard Modular Components
import { DashboardHeaderControls } from '@/components/dashboard/DashboardHeader';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { JourneyAtAGlance } from '@/components/dashboard/JourneyAtAGlance';
import { ProfileSummaryCard } from '@/components/dashboard/ProfileSummaryCard';
import { AssessmentProgressSection } from '@/components/dashboard/AssessmentProgressSection';
import { CareerDiscoveriesCard } from '@/components/dashboard/CareerDiscoveriesCard';
import { ContinueExploringSection } from '@/components/dashboard/ContinueExploringSection';
import { WhatsNextCard } from '@/components/dashboard/WhatsNextCard';
import { SavedJourneySection } from '@/components/dashboard/SavedJourneySection';

import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fallback modules if student has not started any yet
const DEFAULT_MODULES: ModuleProgressDTO[] = [
  {
    module_id: 'academic',
    module_type: 'ACADEMIC',
    title: 'Academic Assessment',
    description: 'Core subject comprehension',
    instructions: 'Evaluate knowledge in core academic subjects.',
    total_questions: 20,
    estimated_duration_minutes: 20,
    status: 'NOT_STARTED',
    score: null,
    answered_count: 0,
    progress_percentage: 0,
    attempt_id: null,
  },
  {
    module_id: 'aptitude',
    module_type: 'APTITUDE',
    title: 'Aptitude Assessment',
    description: 'Logical deduction & reasoning',
    instructions: 'Evaluate logic, pattern recognition, and problem solving.',
    total_questions: 15,
    estimated_duration_minutes: 15,
    status: 'NOT_STARTED',
    score: null,
    answered_count: 0,
    progress_percentage: 0,
    attempt_id: null,
  },
  {
    module_id: 'behavioural',
    module_type: 'BEHAVIOURAL',
    title: 'Behavioural Assessment',
    description: 'Learning style & initiative',
    instructions: 'Assess workplace values and behavioral traits.',
    total_questions: 10,
    estimated_duration_minutes: 10,
    status: 'NOT_STARTED',
    score: null,
    answered_count: 0,
    progress_percentage: 0,
    attempt_id: null,
  },
  {
    module_id: 'situational',
    module_type: 'SITUATIONAL',
    title: 'Situational Assessment',
    description: 'Practical judgment & ethics',
    instructions: 'Review workplace scenarios and judgment calls.',
    total_questions: 10,
    estimated_duration_minutes: 10,
    status: 'NOT_STARTED',
    score: null,
    answered_count: 0,
    progress_percentage: 0,
    attempt_id: null,
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data states
  const [studentProfile, setStudentProfile] = useState<any | null>(null);
  const [modules, setModules] = useState<ModuleProgressDTO[]>(DEFAULT_MODULES);
  const [topCareer, setTopCareer] = useState<CareerRecommendationItem | null>(null);
  const [totalRecommendations, setTotalRecommendations] = useState<number>(0);
  const [preferences, setPreferences] = useState<CareerPreferencesData | null>(null);
  const [savedCareerCodes, setSavedCareerCodes] = useState<string[]>([]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      // 1. Fetch onboarding profile
      const profilePromise = onboardingService.getExistingProfile(token).catch(() => null);

      // 2. Fetch assessment modules progress
      const modulesPromise = assessmentService.getModules(token).catch(() => DEFAULT_MODULES);

      // 3. Fetch career recommendations
      const recommendationsPromise = careerService
        .getRecommendations(token)
        .catch(() => null as CareerRecommendationsResponse | null);

      // 4. Fetch career preferences
      const preferencesPromise = careerService.getPreferences(token).catch(() => null);

      // 5. Read local bookmarks
      const savedCodes = careerService.getSavedCareerCodes();
      setSavedCareerCodes(savedCodes);

      const [profileData, modulesData, recsData, prefData] = await Promise.all([
        profilePromise,
        modulesPromise,
        recommendationsPromise,
        preferencesPromise,
      ]);

      if (profileData) {
        setStudentProfile(profileData);
      }

      if (Array.isArray(modulesData) && modulesData.length > 0) {
        setModules(modulesData);
      }

      if (recsData && Array.isArray(recsData.recommendations) && recsData.recommendations.length > 0) {
        setTopCareer(recsData.recommendations[0]);
        setTotalRecommendations(recsData.total_recommendations || recsData.recommendations.length);
      } else {
        setTopCareer(null);
        setTotalRecommendations(0);
      }

      if (prefData) {
        setPreferences(prefData);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard summary:', err);
      setLoadError(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived user details
  const studentName = user?.display_name || studentProfile?.personal?.full_name || 'Student';
  const studentLevel = studentProfile?.academic?.current_level || 'Class 12';
  const studentStream = studentProfile?.academic?.stream || 'Science (PCM)';

  // Calculate profile completion percentage
  const completedAssessmentsCount = modules.filter((m) => m.status === 'COMPLETED').length;
  const profileCompletionPercentage = useMemo(() => {
    let score = 25; // Base registration
    if (studentProfile) score += 25; // Onboarding completed
    score += completedAssessmentsCount * 12.5; // Up to 50% for 4 assessments
    return Math.min(Math.round(score), 100);
  }, [studentProfile, completedAssessmentsCount]);

  // Compute dynamic primary CTA
  const primaryCta = useMemo(() => {
    const inProgressModule = modules.find((m) => m.status === 'IN_PROGRESS');
    if (inProgressModule) {
      return {
        text: `Continue ${inProgressModule.title.replace(' Assessment', '')} Assessment`,
        action: () =>
          navigate(
            inProgressModule.attempt_id
              ? `/assessments/${inProgressModule.module_id}/attempt`
              : `/assessments/${inProgressModule.module_id}/instructions`
          ),
      };
    }

    const notStartedModule = modules.find((m) => m.status === 'NOT_STARTED');
    if (notStartedModule) {
      return {
        text: `Continue ${notStartedModule.title.replace(' Assessment', '')} Assessment`,
        action: () => navigate(`/assessments/${notStartedModule.module_id}/instructions`),
      };
    }

    return {
      text: 'Explore Career Discovery →',
      action: () => navigate('/career-discovery'),
    };
  }, [modules, navigate]);

  // 5 Journey Steps
  const journeyStages: JourneyStage[] = useMemo(() => {
    const hasAcademicProfile = Boolean(studentProfile || user);
    const assessmentsCompleted = completedAssessmentsCount === 4;
    const hasSavedCareers = savedCareerCodes.length > 0;

    return [
      {
        step: 1,
        id: 'academic_profile',
        title: 'Academic Profile',
        subtitle: hasAcademicProfile ? 'Profile Completed' : 'In Progress',
        status: hasAcademicProfile ? 'completed' : 'in_progress',
        href: '/profile',
      },
      {
        step: 2,
        id: 'assessments',
        title: 'Assessments',
        subtitle: `${completedAssessmentsCount} of 4 Completed`,
        status: assessmentsCompleted ? 'completed' : completedAssessmentsCount > 0 ? 'in_progress' : 'not_started',
        href: '/assessments',
      },
      {
        step: 3,
        id: 'career_discovery',
        title: 'Career Discovery',
        subtitle: totalRecommendations > 0 ? `${totalRecommendations} Matches` : 'Ready to Explore',
        status: totalRecommendations > 0 ? 'completed' : 'available',
        href: '/career-discovery',
      },
      {
        step: 4,
        id: 'career_graph',
        title: 'Career Graph',
        subtitle: 'Interactive Pathways',
        status: 'available',
        href: '/career-graph',
      },
      {
        step: 5,
        id: 'saved_compare',
        title: 'Saved & Compare',
        subtitle: hasSavedCareers ? `${savedCareerCodes.length} Shortlisted` : 'Shortlist Paths',
        status: hasSavedCareers ? 'completed' : 'available',
        href: '/saved-paths',
      },
    ];
  }, [studentProfile, user, completedAssessmentsCount, totalRecommendations, savedCareerCodes.length]);

  // Recent activity entries
  const recentActivities: RecentActivityItem[] = useMemo(() => {
    const list: RecentActivityItem[] = [];

    // From completed assessments
    modules
      .filter((m) => m.status === 'COMPLETED')
      .forEach((m) => {
        list.push({
          id: `act_mod_${m.module_id}`,
          title: `${m.title} Completed`,
          type: 'assessment',
          timestamp: 'Recent',
          href: m.attempt_id
            ? `/assessments/${m.module_id}/${m.attempt_id}/results`
            : '/assessments',
        });
      });

    // From saved careers
    savedCareerCodes.slice(0, 3).forEach((code, idx) => {
      const cleanName = code.replace(/^CAREER_/, '').replace(/_/g, ' ');
      list.push({
        id: `act_saved_${idx}`,
        title: cleanName,
        type: 'career',
        timestamp: 'Saved',
        href: '/career-discovery',
      });
    });

    return list;
  }, [modules, savedCareerCodes]);

  if (isLoading) {
    return (
      <AppLayout breadcrumbs={[{ label: 'Dashboard' }]}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-semibold text-foreground">Loading your dashboard...</p>
          <p className="text-xs text-muted">Retrieving assessment milestones and career pathways.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbs={[{ label: 'Dashboard' }]}
      headerRight={
        <DashboardHeaderControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      }
    >
      <div className="space-y-6 sm:space-y-8 animate-fade-in text-left">
        {loadError && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
            <span>Some dashboard information could not be synced: {loadError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              className="h-7 text-xs gap-1 rounded-lg"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* 1. Welcome Banner */}
        <WelcomeBanner
          userName={studentName}
          studentLevel={studentLevel}
          studentStream={studentStream}
          profileCompletion={profileCompletionPercentage}
          primaryCtaText={primaryCta.text}
          onPrimaryCtaClick={primaryCta.action}
        />

        {/* 2. Connected Journey (7 cols) + Profile Summary (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <JourneyAtAGlance stages={journeyStages} className="h-full" />
          </div>
          <div className="lg:col-span-5 flex flex-col">
            <ProfileSummaryCard
              studentName={studentName}
              studentLevel={studentLevel}
              studentStream={studentStream}
              profileCompletion={profileCompletionPercentage}
              interests={preferences?.interests || ['Technology', 'Problem-solving', 'Data Analysis']}
              goal={preferences?.preferred_careers?.[0] ? `Build a career as a ${preferences.preferred_careers[0]}` : 'Build a career in technology and engineering.'}
              careerPreferences={preferences?.preferred_careers || ['Software Engineer', 'Data Scientist']}
              className="h-full"
            />
          </div>
        </div>

        {/* 3. Assessment Progress (4 cards in a row on desktop) */}
        <AssessmentProgressSection modules={modules} />

        {/* 4. Career Discoveries Summary */}
        <CareerDiscoveriesCard
          topCareer={topCareer}
          totalRecommendationsCount={totalRecommendations}
          savedCareersCount={savedCareerCodes.length}
          comparisonsCount={0}
        />

        {/* 5. Continue Exploring (7 cols) + What's Next? (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <ContinueExploringSection columns={2} className="h-full" />
          </div>
          <div className="lg:col-span-5 flex flex-col">
            <WhatsNextCard
              modules={modules}
              savedCareersCount={savedCareerCodes.length}
              className="h-full"
            />
          </div>
        </div>

        {/* 6. Saved Journey Section */}
        <SavedJourneySection
          savedPathsCount={0}
          savedCareersCount={savedCareerCodes.length}
          comparisonsCount={0}
          recentActivities={recentActivities}
        />
      </div>
    </AppLayout>
  );
}

export default Dashboard;
