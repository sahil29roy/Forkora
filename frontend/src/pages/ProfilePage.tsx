import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PreferencesModal } from '@/components/career-discovery/PreferencesModal';
import { authApi, type AuthUser } from '@/services/auth/authApi';
import { onboardingService } from '@/services/onboarding.service';
import { assessmentService } from '@/services/assessment.service';
import { careerService } from '@/services/career.service';
import type { ModuleProgressDTO } from '@/types/assessment.types';
import type { CareerPreferencesData, CareerRecommendationItem } from '@/types/career.types';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  GraduationCap,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Edit3,
  LogOut,
  Compass,
  GitBranch,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  Briefcase,
  Heart,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Key,
  RefreshCw,
  FileText,
  Check,
  X,
  Loader2,
  TrendingUp,
  Percent,
} from 'lucide-react';

export interface AcademicSubjectItem {
  id?: number;
  subject_name: string;
  marks_obtained: number;
  maximum_marks: number;
  marks_percentage: number;
  grade: string;
}

export interface StudentFullProfile {
  student_name: string;
  current_class: number;
  phone_number?: string | null;
  contact_email?: string | null;
  father_name: string;
  father_occupation?: string | null;
  mother_name: string;
  mother_occupation?: string | null;
  interests?: string[];
  preferred_careers?: string[];
  work_environment?: string;
  career_type?: string;
  preferred_location?: string;
}

export interface AcademicRecordFull {
  education_board: string;
  stream: string | null;
  class_level: number;
  subjects: AcademicSubjectItem[];
}

export function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('forkora_auth_token');

  // State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentFullProfile | null>(null);
  const [academicRecord, setAcademicRecord] = useState<AcademicRecordFull | null>(null);
  const [assessmentModules, setAssessmentModules] = useState<ModuleProgressDTO[]>([]);
  const [preferences, setPreferences] = useState<CareerPreferencesData>({
    preferred_careers: ['Software Engineer', 'Data Scientist'],
    interests: ['Technology & Computers', 'Mathematics'],
    work_environment: 'Office-based',
    career_type: 'Private Sector',
    preferred_location: 'India',
  });
  const [topCareers, setTopCareers] = useState<CareerRecommendationItem[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Tab & Modal State
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'academic' | 'career' | 'family' | 'security'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isEditPreferencesOpen, setIsEditPreferencesOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Form Fields
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formFatherName, setFormFatherName] = useState('');
  const [formFatherOcc, setFormFatherOcc] = useState('');
  const [formMotherName, setFormMotherName] = useState('');
  const [formMotherOcc, setFormMotherOcc] = useState('');

  // Primary Data Fetcher
  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // 1. Fetch User details from /api/auth/me
      const authPromise = authApi.getProfile(token).catch(() => null);

      // 2. Fetch Onboarding and Academic record from /api/onboarding
      const onboardingPromise = onboardingService.getExistingProfile(token).catch(() => null);

      // 3. Fetch Assessment Assignments from /api/assessments/modules
      const assessmentPromise = assessmentService.getModules(token).catch(() => []);

      // 4. Fetch Career Preferences from /api/careers/preferences
      const preferencesPromise = careerService.getPreferences(token).catch(() => null);

      // 5. Fetch Top Recommendations (deterministic from all assessments & marks)
      const recommendationsPromise = careerService.getRecommendations(token).catch(() => null);

      const [authRes, onboardingRes, assessRes, prefRes, recRes] = await Promise.all([
        authPromise,
        onboardingPromise,
        assessmentPromise,
        preferencesPromise,
        recommendationsPromise,
      ]);

      if (authRes?.user) {
        setUser(authRes.user);
        setFormDisplayName(authRes.user.display_name || '');
      }

      if (onboardingRes) {
        const sp = onboardingRes.studentProfile || onboardingRes.student_profile || onboardingRes;
        const ar = onboardingRes.academicRecord || onboardingRes.academic_record;

        if (sp) {
          setStudentProfile({
            student_name: sp.student_name || authRes?.user?.display_name || 'Student',
            current_class: Number(sp.current_class || 10),
            phone_number: sp.phone_number || authRes?.user?.phone || null,
            contact_email: sp.contact_email || authRes?.user?.email || null,
            father_name: sp.father_name || 'Parent / Guardian',
            father_occupation: sp.father_occupation || null,
            mother_name: sp.mother_name || 'Parent / Guardian',
            mother_occupation: sp.mother_occupation || null,
            interests: sp.interests || [],
            preferred_careers: sp.preferred_careers || [],
            work_environment: sp.work_environment || 'Office-based',
            career_type: sp.career_type || 'Private Sector',
            preferred_location: sp.preferred_location || 'India',
          });

          setFormPhone(sp.phone_number || authRes?.user?.phone || '');
          setFormFatherName(sp.father_name || '');
          setFormFatherOcc(sp.father_occupation || '');
          setFormMotherName(sp.mother_name || '');
          setFormMotherOcc(sp.mother_occupation || '');
        }

        if (ar) {
          // Deterministically map all enrolled subjects with their exact marks_obtained and maximum_marks
          const rawSubs = Array.isArray(ar.subjects) ? ar.subjects : [];
          const mappedSubs: AcademicSubjectItem[] = rawSubs.map((s: any) => {
            const obtained = Number(s.marks_obtained ?? s.marks_percentage ?? 0);
            const max = Number(s.maximum_marks ?? 100);
            const pct = max > 0 ? Math.round((obtained / max) * 100) : Math.round(obtained);
            const grade =
              s.grade ||
              (pct >= 90
                ? 'A1'
                : pct >= 80
                ? 'A2'
                : pct >= 70
                ? 'B1'
                : pct >= 60
                ? 'B2'
                : pct >= 50
                ? 'C1'
                : 'C2');

            return {
              id: s.id,
              subject_name: s.subject_name || 'Subject',
              marks_obtained: obtained,
              maximum_marks: max,
              marks_percentage: pct,
              grade,
            };
          });

          setAcademicRecord({
            education_board: ar.education_board || 'CBSE',
            stream: ar.stream || null,
            class_level: Number(ar.class_level || sp?.current_class || 10),
            subjects: mappedSubs,
          });
        }
      }

      if (assessRes && assessRes.length > 0) {
        setAssessmentModules(assessRes);
      }

      if (prefRes) {
        setPreferences(prefRes);
      }

      if (recRes && recRes.recommendations) {
        setTopCareers(recRes.recommendations.slice(0, 4));
      }

      setSavedCount(careerService.getSavedCareerCodes().length);
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      // 1. Update basic user details
      await authApi.updateProfile({ display_name: formDisplayName, phone: formPhone }, token);

      // 2. Update parent details if provided
      if (formFatherName && formMotherName) {
        await onboardingService.updateParents(
          {
            father_name: formFatherName,
            father_occupation: formFatherOcc || undefined,
            mother_name: formMotherName,
            mother_occupation: formMotherOcc || undefined,
          },
          token
        );
      }

      setFeedbackMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditProfileOpen(false);
        setFeedbackMsg(null);
        loadProfileData();
      }, 1000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    localStorage.removeItem('forkora_auth_token');
    localStorage.removeItem('forkora_session_id');
    navigate('/login');
  };

  // Compute exact academic aggregate from enrolled subject marks in DB
  const subjectsList = useMemo(() => {
    return academicRecord?.subjects || [];
  }, [academicRecord]);

  const academicAggregate = useMemo(() => {
    if (subjectsList.length === 0) return 0;
    const totalObtained = subjectsList.reduce((sum, s) => sum + Number(s.marks_obtained || 0), 0);
    const totalMax = subjectsList.reduce((sum, s) => sum + Number(s.maximum_marks || 100), 0);
    return totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
  }, [subjectsList]);

  // Compute completed assessments count
  const completedAssessmentsCount = useMemo(() => {
    return assessmentModules.filter((m) => m.status === 'COMPLETED').length;
  }, [assessmentModules]);

  const assessmentReadinessPercentage = useMemo(() => {
    if (assessmentModules.length === 0) return 0;
    return Math.round((completedAssessmentsCount / assessmentModules.length) * 100);
  }, [completedAssessmentsCount, assessmentModules]);

  // Formatter for assessment scores
  const formatScore = (m: ModuleProgressDTO) => {
    if (m.status !== 'COMPLETED' || m.score === null) return 'Pending Evaluation';
    if (m.module_id === 'behavioural' || m.module_id === 'situational') {
      const fivePt = (Number(m.score) / 20).toFixed(1);
      return `${fivePt} / 5.0 (${Math.round(Number(m.score))}%)`;
    }
    return `${Math.round(Number(m.score))}%`;
  };

  const getModuleCategory = (modId: string) => {
    switch (modId.toLowerCase()) {
      case 'academic':
        return 'Core Academic Grasp & Subject Competencies';
      case 'aptitude':
        return 'Logical Deduction & Numerical Reasoning Velocity';
      case 'behavioural':
        return 'Psychological Alignment & Work-Style Traits';
      case 'situational':
        return 'Scenario Dilemmas & Ethical Decision Judgment';
      default:
        return 'Evaluative Diagnostic';
    }
  };

  if (isLoading) {
    return (
      <AppLayout breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse">
            Loading student profile and evaluative records from database...
          </p>
        </div>
      </AppLayout>
    );
  }

  const displayName = user?.display_name || studentProfile?.student_name || 'Student Account';
  const email = user?.email || studentProfile?.contact_email || 'student@forkora.edu';
  const currentClass = academicRecord?.class_level || studentProfile?.current_class || 10;
  const board = academicRecord?.education_board || 'CBSE';
  const streamDisplay =
    currentClass <= 10
      ? 'Class 10 (Secondary Foundation)'
      : academicRecord?.stream || 'Senior Secondary Stream';

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Student Profile' },
      ]}
      headerRight={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditProfileOpen(true)}
            className="gap-1.5 h-8 text-xs font-semibold rounded-lg"
          >
            <Edit3 className="h-3.5 w-3.5 text-primary" />
            <span>Edit Profile</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5 h-8 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 sm:space-y-8 animate-fade-in text-left pb-16">
        {/* Hero Profile Overview Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Avatar & Identity Details */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md ring-4 ring-background">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center shadow-xs"
                  title="Account Active"
                >
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground truncate">
                    {displayName}
                  </h1>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-xs font-semibold gap-1"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    Verified Student
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider">
                    {user?.role || 'STUDENT'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {email}
                  </span>
                  {(studentProfile?.phone_number || user?.phone) && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {studentProfile?.phone_number || user?.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Joined{' '}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'November 2026'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                    {streamDisplay}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {board} Board
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-semibold"
                  >
                    {academicAggregate}% Real Academic Aggregate
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right: Assessment Readiness Badge & Edit Action */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-border/60 shrink-0">
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Assignment Readiness
                </span>
                <span className="text-xl sm:text-2xl font-black text-primary">
                  {assessmentReadinessPercentage}% Complete
                </span>
                <span className="text-xs text-muted-foreground block">
                  {completedAssessmentsCount} of {assessmentModules.length} Evaluative Modules Finished
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="gap-1.5 text-xs font-semibold h-8.5 rounded-xl shadow-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 border-b border-border scrollbar-thin">
          {[
            { id: 'overview', label: 'Profile Overview', icon: User },
            {
              id: 'assessments',
              label: 'Assignment Marks & Evaluations',
              icon: BrainCircuit,
              count: assessmentModules.length,
            },
            {
              id: 'academic',
              label: 'Academic Subjects & School Marks',
              icon: GraduationCap,
              count: subjectsList.length,
            },
            { id: 'career', label: 'Career Preferences & Recommendations', icon: Compass },
            { id: 'family', label: 'Family & Guardians', icon: Heart },
            { id: 'security', label: 'Account & Security', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <Badge variant={isActive ? 'secondary' : 'outline'} className="ml-1 text-[10px] h-4.5 px-1.5">
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Class & Stream
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground">Class {currentClass}</div>
                <p className="text-xs text-muted-foreground truncate">{board} Board</p>
              </div>

              <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    School Marks Aggregate
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Percent className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground">{academicAggregate}%</div>
                <p className="text-xs text-muted-foreground truncate">
                  Across {subjectsList.length} Enrolled Subjects in Database
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Assignments Finished
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {completedAssessmentsCount} / {assessmentModules.length}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {assessmentReadinessPercentage}% Assessment Complete
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Saved Pathways
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <GitBranch className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-foreground">{savedCount}</div>
                <Link to="/career-graph" className="text-xs text-primary hover:underline font-semibold block truncate">
                  Explore Full Career Graph →
                </Link>
              </div>
            </div>

            {/* Dynamic Assessment Snapshot Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    <span>Evaluative Assessment Marks & Assignment Outcomes</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real deterministic test performance from the 4 assessment modules: Academic, Aptitude, Situational,
                    and Behavioural
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('assessments')}
                  className="gap-1.5 text-xs font-semibold h-8"
                >
                  <span>View Breakdown</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {assessmentModules.map((mod) => {
                  const isCompleted = mod.status === 'COMPLETED';
                  const isProgress = mod.status === 'IN_PROGRESS';

                  return (
                    <div
                      key={mod.module_id}
                      className="p-4 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/30 transition-colors space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
                          {mod.title.replace(' Assessment', '')}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 font-semibold ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : isProgress
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? 'Completed' : isProgress ? 'In Progress' : 'Not Started'}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <span className="text-2xl font-black text-foreground">{formatScore(mod)}</span>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCompleted ? 'bg-primary' : isProgress ? 'bg-amber-500' : 'bg-muted'
                            }`}
                            style={{
                              width: `${isCompleted ? Math.min(100, Math.round(Number(mod.score || 100))) : mod.progress_percentage || 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                        <span>
                          {mod.answered_count} / {mod.total_questions} Qs
                        </span>
                        <Link
                          to={
                            isCompleted && mod.attempt_id
                              ? `/assessments/${mod.module_id}/${mod.attempt_id}/results`
                              : isProgress && mod.attempt_id
                              ? `/assessments/${mod.module_id}/${mod.attempt_id}`
                              : `/assessments/${mod.module_id}/instructions`
                          }
                          className="font-semibold text-primary hover:underline flex items-center gap-0.5"
                        >
                          <span>{isCompleted ? 'Review' : 'Take Test'}</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Academic & Top Career Recommendations Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Academic Highlights */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span>School Subject Marks ({subjectsList.length} Subjects)</span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('academic')}
                    className="text-xs text-primary font-semibold h-7"
                  >
                    View All →
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {subjectsList.slice(0, 5).map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/20 border border-border/50"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{sub.subject_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          {sub.marks_obtained} / {sub.maximum_marks}
                        </span>
                        <span className="font-bold text-foreground">{sub.marks_percentage}%</span>
                        <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 font-bold">
                          {sub.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Recommendations Determined from Scores */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span>Top Compatible Careers (Computed Engine Scores)</span>
                  </h3>
                  <Link to="/career-discovery" className="text-xs text-primary font-semibold hover:underline">
                    Explore All 12 →
                  </Link>
                </div>

                <div className="space-y-3">
                  {topCareers.slice(0, 3).map((c) => (
                    <div
                      key={c.career_code}
                      className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground truncate max-w-[180px]">
                          {c.career}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[11px] font-bold text-emerald-600 border-emerald-500/30 bg-emerald-500/5"
                        >
                          {c.compatibilityScore}% Compatibility
                        </Badge>
                      </div>

                      {/* Component Breakdown Chips */}
                      {c.breakdown && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                          <span className="bg-muted px-1.5 py-0.5 rounded">
                            Acad: <strong>{c.breakdown.academic_score}%</strong>
                          </span>
                          <span className="bg-muted px-1.5 py-0.5 rounded">
                            Apti: <strong>{c.breakdown.aptitude_score}%</strong>
                          </span>
                          <span className="bg-muted px-1.5 py-0.5 rounded">
                            Behav: <strong>{c.breakdown.behavioural_score}%</strong>
                          </span>
                          <span className="bg-muted px-1.5 py-0.5 rounded">
                            Situ: <strong>{c.breakdown.situational_score}%</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNMENTS & EVALUATIONS */}
        {activeTab === 'assessments' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    <span>Evaluative Assignments & Psychometric Dimensions</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Your real performance marks across Academic, Aptitude, Situational Judgment, and Behavioural
                    assessments.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border text-left sm:text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Completed Evaluations
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-foreground">
                    {completedAssessmentsCount} of {assessmentModules.length} Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Complete Grid of 4 Assignment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {assessmentModules.map((mod) => {
                const isCompleted = mod.status === 'COMPLETED';
                const isProgress = mod.status === 'IN_PROGRESS';

                return (
                  <div
                    key={mod.module_id}
                    className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`text-xs px-2.5 py-0.5 font-semibold ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : isProgress
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? 'Evaluation Finished' : isProgress ? 'In Progress' : 'Not Started'}
                        </Badge>

                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {mod.estimated_duration_minutes} Mins Duration
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-foreground">{mod.title}</h4>
                        <span className="text-xs text-primary font-medium block mt-0.5">
                          {getModuleCategory(mod.module_id)}
                        </span>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>

                      {/* Score & Progress Display */}
                      <div className="p-4 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Evaluated Mark
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-foreground">{formatScore(mod)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Questions Responded
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {mod.answered_count} / {mod.total_questions} Questions
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-border/60">
                      {isCompleted && mod.attempt_id ? (
                        <Link to={`/assessments/${mod.module_id}/${mod.attempt_id}/results`} className="w-full block">
                          <Button variant="default" className="w-full gap-2 text-xs font-semibold h-9 rounded-xl">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Review Comprehensive Results</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      ) : isProgress && mod.attempt_id ? (
                        <Link to={`/assessments/${mod.module_id}/${mod.attempt_id}`} className="w-full block">
                          <Button className="w-full gap-2 text-xs font-semibold h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Resume In-Progress Assessment</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/assessments/${mod.module_id}/instructions`} className="w-full block">
                          <Button variant="outline" className="w-full gap-2 text-xs font-semibold h-9 rounded-xl">
                            <span>Start Assessment Module</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ACADEMIC DETAILS */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span>Academic Subjects & Enrolled Marks Breakdown</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Individual subject marks recorded in your onboarding profile, used directly by the recommendation
                    scoring engine.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-semibold">
                    {board} Board
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 font-semibold">
                    {streamDisplay}
                  </Badge>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Subject Name</th>
                      <th className="py-3 px-4">Marks Obtained / Max</th>
                      <th className="py-3 px-4">Scored Percentage</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4 text-right">Performance Bar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {subjectsList.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-foreground flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span>{sub.subject_name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground font-medium">
                          {sub.marks_obtained} / {sub.maximum_marks}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">{sub.marks_percentage}%</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="secondary" className="font-bold text-xs">
                            {sub.grade}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="w-24 sm:w-32 bg-muted rounded-full h-2 inline-block overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${Math.min(100, sub.marks_percentage)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Academic Summary Footer */}
              <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>
                  Calculated Overall Aggregate:{' '}
                  <strong className="text-foreground text-sm font-bold">{academicAggregate}%</strong>
                </span>
                <span>
                  Total Enrolled Subjects in Database:{' '}
                  <strong className="text-foreground font-bold">{subjectsList.length}</strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CAREER PREFERENCES */}
        {activeTab === 'career' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    <span>Career Preferences & Sector Ambitions</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your preferred careers and domains, matched with your assessment scores to generate compatibility rankings
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsEditPreferencesOpen(true)}
                  className="gap-1.5 text-xs font-semibold h-8.5 rounded-xl"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Preferences</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Target Careers
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {preferences.preferred_careers?.map((c, i) => (
                      <Badge
                        key={i}
                        className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold py-1 px-2.5"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Interest Domains
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {preferences.interests?.map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs py-1 px-2.5">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Work Environment
                  </span>
                  <p className="text-sm font-semibold text-foreground">{preferences.work_environment}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Preferred Career Sector
                  </span>
                  <p className="text-sm font-semibold text-foreground">{preferences.career_type}</p>
                </div>
              </div>
            </div>

            {/* Top Recommended Career Snapshot */}
            {topCareers.length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Deterministic Career Recommendations (Derived from all 4 Assessments)</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Weighted compatibility computed using your actual Academic, Aptitude, Behavioural, Situational,
                      and Preference scores.
                    </p>
                  </div>
                  <Link to="/career-discovery" className="text-xs text-primary font-semibold hover:underline">
                    Explore All Recommendations →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topCareers.map((c) => (
                    <div
                      key={c.career_code}
                      className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground truncate max-w-[200px]">
                          {c.career}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs font-bold text-emerald-600 border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5"
                        >
                          {c.compatibilityScore}% Match
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>

                      {/* Deterministic Score Breakdown */}
                      {c.breakdown && (
                        <div className="p-2.5 rounded-lg bg-background border border-border/60 space-y-1.5 text-[11px]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Deterministic Score Breakdown:
                          </span>
                          <div className="grid grid-cols-3 gap-1 text-muted-foreground">
                            <span>
                              Acad: <strong className="text-foreground">{c.breakdown.academic_score}%</strong>
                            </span>
                            <span>
                              Apti: <strong className="text-foreground">{c.breakdown.aptitude_score}%</strong>
                            </span>
                            <span>
                              Behav: <strong className="text-foreground">{c.breakdown.behavioural_score}%</strong>
                            </span>
                            <span>
                              Situ: <strong className="text-foreground">{c.breakdown.situational_score}%</strong>
                            </span>
                            <span>
                              Pref: <strong className="text-foreground">{c.breakdown.preferences_score}%</strong>
                            </span>
                            <span>
                              ML: <strong className="text-foreground">{c.breakdown.ml_score}%</strong>
                            </span>
                          </div>
                        </div>
                      )}

                      <Link
                        to={`/career-graph?career=${encodeURIComponent(c.career_code)}`}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 pt-1 block"
                      >
                        <span>View Educational Pathway Graph</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FAMILY & GUARDIANS */}
        {activeTab === 'family' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Heart className="h-5 w-5 text-rose-500" />
                    <span>Parent & Guardian Information</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Recorded parental contacts and occupations for academic counseling and communications
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="gap-1.5 text-xs font-semibold h-8.5 rounded-xl"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Guardian Details</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                {/* Father Card */}
                <div className="p-5 rounded-2xl border border-border/70 bg-muted/20 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                      F
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Father / Primary Guardian
                      </span>
                      <h4 className="text-base font-bold text-foreground">
                        {studentProfile?.father_name || 'Not Provided'}
                      </h4>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/50 text-xs space-y-1">
                    <span className="text-muted-foreground">Occupation: </span>
                    <strong className="text-foreground">
                      {studentProfile?.father_occupation || 'Private Sector / Professional'}
                    </strong>
                  </div>
                </div>

                {/* Mother Card */}
                <div className="p-5 rounded-2xl border border-border/70 bg-muted/20 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                      M
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Mother / Secondary Guardian
                      </span>
                      <h4 className="text-base font-bold text-foreground">
                        {studentProfile?.mother_name || 'Not Provided'}
                      </h4>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/50 text-xs space-y-1">
                    <span className="text-muted-foreground">Occupation: </span>
                    <strong className="text-foreground">
                      {studentProfile?.mother_occupation || 'Homemaker / Professional'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY & ACCOUNT */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
              <div className="border-b border-border/60 pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  <span>Account Credentials & Security Settings</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Manage authentication, password reset, and active session controls
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/60 gap-3">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Email Verification</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.is_email_verified
                        ? 'Your email address is verified and active.'
                        : 'Email verification required.'}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-xs font-semibold gap-1 shrink-0"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/60 gap-3">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Password Management</span>
                    <span className="text-xs text-muted-foreground">
                      Change or reset your login credentials securely with email OTP verification.
                    </span>
                  </div>
                  <Link to="/forgot-password">
                    <Button variant="outline" size="sm" className="text-xs font-semibold h-8.5 rounded-lg shrink-0">
                      Reset Password
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 gap-3">
                  <div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">Session Management</span>
                    <span className="text-xs text-muted-foreground">
                      Sign out from this device to end your active authenticated session.
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-xs font-semibold h-8.5 rounded-lg text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 shrink-0"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Edit Student Profile</h3>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                }`}
              >
                {feedbackMsg.type === 'success' ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Full Display Name</label>
                <Input
                  type="text"
                  required
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="e.g. Piyush"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Phone Number</label>
                <Input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="pt-2 border-t border-border/60">
                <h4 className="font-bold text-foreground mb-2">Guardian Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Father's Name</label>
                    <Input
                      type="text"
                      required
                      value={formFatherName}
                      onChange={(e) => setFormFatherName(e.target.value)}
                      placeholder="Father's full name"
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Father's Occupation</label>
                    <Input
                      type="text"
                      value={formFatherOcc}
                      onChange={(e) => setFormFatherOcc(e.target.value)}
                      placeholder="Occupation"
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Mother's Name</label>
                    <Input
                      type="text"
                      required
                      value={formMotherName}
                      onChange={(e) => setFormMotherName(e.target.value)}
                      placeholder="Mother's full name"
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Mother's Occupation</label>
                    <Input
                      type="text"
                      value={formMotherOcc}
                      onChange={(e) => setFormMotherOcc(e.target.value)}
                      placeholder="Occupation"
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="h-9 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="h-9 text-xs font-bold rounded-xl gap-1.5">
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PREFERENCES MODAL */}
      <PreferencesModal
        isOpen={isEditPreferencesOpen}
        onClose={() => setIsEditPreferencesOpen(false)}
        initialPreferences={preferences}
        onPreferencesUpdated={loadProfileData}
      />
    </AppLayout>
  );
}

export default ProfilePage;
