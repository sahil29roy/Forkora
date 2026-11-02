import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CareerDiscoveryHeader } from '@/components/career-discovery/CareerDiscoveryHeader';
import { RecommendationsBanner } from '@/components/career-discovery/RecommendationsBanner';
import { AssessmentSummaryCard } from '@/components/career-discovery/AssessmentSummaryCard';
import { CareerProfileCard } from '@/components/career-discovery/CareerProfileCard';
import { RecommendedCareersList } from '@/components/career-discovery/RecommendedCareersList';
import { SelectedCareerPanel } from '@/components/career-discovery/SelectedCareerPanel';
import { CareerComparisonModal } from '@/components/career-discovery/CareerComparisonModal';
import { PreferencesModal } from '@/components/career-discovery/PreferencesModal';
import { careerService } from '@/services/career.service';
import { assessmentService } from '@/services/assessment.service';
import { onboardingService } from '@/services/onboarding.service';
import type {
  CareerRecommendationItem,
  AssessmentOverviewMetric,
  CareerPreferencesData,
} from '@/types/career.types';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fallback recommendations if user has no assessments or onboarding yet
const DEFAULT_CAREERS: CareerRecommendationItem[] = [
  {
    career: 'Software Engineer',
    career_code: 'CAREER_SOFTWARE_ENGINEER',
    node_id: 28,
    compatibilityScore: 86,
    eligibility: 'eligible',
    reasons: [
      'Strong academic performance in relevant Mathematics coursework',
      'High problem-solving and algorithmic reasoning aptitude',
      'Matches your primary technical career preference',
    ],
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'JEE Main', 'B.Tech Computer Science', 'Software Engineer'],
        total_duration_months: 48,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'B.Sc Data Science & Mathematics', 'Software Engineer'],
        total_duration_months: 36,
      },
      {
        pathway_id: 'pathway_3',
        title: 'Alternative Pathway 2',
        nodes: ['Class 10', 'Class 12 Senior Secondary', 'BCA (Computer Applications)', 'Software Engineer'],
        total_duration_months: 36,
      },
    ],
    breakdown: {
      ml_score: 84,
      academic_score: 88,
      aptitude_score: 85,
      behavioural_score: 82,
      situational_score: 80,
      preferences_score: 90,
      weights: { ml: 0.3, academic: 0.25, aptitude: 0.12, behavioural: 0.13, situational: 0.1, preferences: 0.1 },
    },
    salary_range_inr: { min: 600000, max: 3500000, median: 1400000 },
    skills: ['Software Architecture', 'Full Stack Development', 'Problem Solving', 'Cloud Computing'],
    description: 'Architects, codes, and maintains scalable digital systems, cloud platforms, and distributed software solutions.',
    domain: 'Technology · Engineering · Development',
  },
  {
    career: 'Data Scientist',
    career_code: 'CAREER_DATA_SCIENTIST',
    node_id: 29,
    compatibilityScore: 82,
    eligibility: 'eligible',
    reasons: [
      'Exceptional analytical aptitude and statistical reasoning',
      'Strong performance in quantitative Mathematics assessment',
      'High alignment with curiosity and investigative traits',
    ],
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'CUET UG', 'B.Sc Data Science & Mathematics', 'Data Scientist'],
        total_duration_months: 36,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'JEE Main', 'B.Tech Computer Science', 'Data Scientist'],
        total_duration_months: 48,
      },
    ],
    breakdown: {
      ml_score: 80,
      academic_score: 85,
      aptitude_score: 88,
      behavioural_score: 80,
      situational_score: 75,
      preferences_score: 78,
      weights: { ml: 0.3, academic: 0.25, aptitude: 0.12, behavioural: 0.13, situational: 0.1, preferences: 0.1 },
    },
    salary_range_inr: { min: 800000, max: 4000000, median: 1600000 },
    skills: ['Machine Learning', 'Statistical Modeling', 'Python', 'Big Data Analytics'],
    description: 'Applies statistical modeling, machine learning, and computational tools to uncover predictive insights and build AI agents.',
    domain: 'Data Science · Artificial Intelligence',
  },
  {
    career: 'Cybersecurity Analyst',
    career_code: 'CAREER_CYBERSECURITY',
    node_id: 30,
    compatibilityScore: 76,
    eligibility: 'eligible',
    reasons: [
      'High logical deduction velocity and attention to detail',
      'Solid foundational comprehension in computer science',
      'Strong resilience under situational pressure',
    ],
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'B.Tech Computer Science', 'Cybersecurity Analyst'],
        total_duration_months: 48,
      },
    ],
    breakdown: {
      ml_score: 75,
      academic_score: 80,
      aptitude_score: 78,
      behavioural_score: 76,
      situational_score: 74,
      preferences_score: 70,
      weights: { ml: 0.3, academic: 0.25, aptitude: 0.12, behavioural: 0.13, situational: 0.1, preferences: 0.1 },
    },
    salary_range_inr: { min: 550000, max: 3000000, median: 1200000 },
    skills: ['Network Security', 'Ethical Hacking', 'Threat Modeling', 'Cryptography'],
    description: 'Safeguards organizational digital assets, conducts penetration testing, threat hunting, and designs defense systems.',
    domain: 'Information Security · Infrastructure',
  },
  {
    career: 'Product Manager',
    career_code: 'CAREER_PRODUCT_MANAGER',
    node_id: 35,
    compatibilityScore: 72,
    eligibility: 'conditionally_eligible',
    reasons: [
      'Balanced interdisciplinary score across technical and leadership dimensions',
      'High situational judgment and practical decision-making',
    ],
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway',
        nodes: ['Class 10', 'Class 12 Any Stream', 'BBA Business Administration', 'Product Manager'],
        total_duration_months: 36,
      },
    ],
    breakdown: {
      ml_score: 70,
      academic_score: 74,
      aptitude_score: 75,
      behavioural_score: 78,
      situational_score: 82,
      preferences_score: 65,
      weights: { ml: 0.3, academic: 0.25, aptitude: 0.12, behavioural: 0.13, situational: 0.1, preferences: 0.1 },
    },
    salary_range_inr: { min: 900000, max: 4500000, median: 1800000 },
    skills: ['Product Strategy', 'User Empathy', 'Data-Driven Decision Making', 'Agile Roadmapping'],
    description: 'Sits at the intersection of technology, business, and user experience to define product vision and roadmap execution.',
    domain: 'Business · Product & Leadership',
  },
  {
    career: 'UI/UX Designer',
    career_code: 'CAREER_UI_UX_DESIGNER',
    node_id: 39,
    compatibilityScore: 69,
    eligibility: 'eligible',
    reasons: [
      'High creativity and design thinking indicators',
      'Strong visual communication and user empathy scores',
    ],
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway',
        nodes: ['Class 10', 'Class 12 Any Stream', 'UCEED', 'B.Des (Bachelor of Design)', 'UI/UX Designer'],
        total_duration_months: 48,
      },
    ],
    breakdown: {
      ml_score: 68,
      academic_score: 70,
      aptitude_score: 72,
      behavioural_score: 84,
      situational_score: 70,
      preferences_score: 60,
      weights: { ml: 0.3, academic: 0.25, aptitude: 0.12, behavioural: 0.13, situational: 0.1, preferences: 0.1 },
    },
    salary_range_inr: { min: 500000, max: 2800000, median: 1100000 },
    skills: ['Interaction Design', 'Wireframing', 'Design Systems', 'Usability Testing'],
    description: 'Creates intuitive visual interfaces, conducts usability tests, and builds delightful customer journeys across digital products.',
    domain: 'Design · Visual Communication',
  },
];

const DEFAULT_METRICS: AssessmentOverviewMetric[] = [
  { id: 'academic', name: 'Academic', scoreText: '80%', scoreValue: 80, maxValue: 100, status: 'completed', icon: 'BookOpen' },
  { id: 'aptitude', name: 'Aptitude', scoreText: '70%', scoreValue: 70, maxValue: 100, status: 'completed', icon: 'BrainCircuit' },
  { id: 'behavioural', name: 'Behavioural', scoreText: '4.1 / 5', scoreValue: 4.1, maxValue: 5, status: 'completed', icon: 'Users' },
  { id: 'situational', name: 'Situational', scoreText: '3.8 / 5', scoreValue: 3.8, maxValue: 5, status: 'completed', icon: 'Compass' },
];

export function CareerDiscoveryPage() {
  const [careers, setCareers] = useState<CareerRecommendationItem[]>(DEFAULT_CAREERS);
  const [selectedCareer, setSelectedCareer] = useState<CareerRecommendationItem>(DEFAULT_CAREERS[0]);
  const [metrics, setMetrics] = useState<AssessmentOverviewMetric[]>(DEFAULT_METRICS);
  const [studentLevel, setStudentLevel] = useState<string>('Class 12');
  const [studentStream, setStudentStream] = useState<string | null>('Science (PCM)');
  const [preferences, setPreferences] = useState<CareerPreferencesData>({
    preferred_careers: ['Software Engineer', 'Data Scientist'],
    interests: ['Technology & Computers', 'Mathematics'],
    work_environment: 'Office-based',
    career_type: 'Private Sector',
    preferred_location: 'India',
  });

  const [savedCodes, setSavedCodes] = useState<string[]>(() => careerService.getSavedCareerCodes());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Load backend recommendations & student profile
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch live recommendations from API
      const recRes = await careerService.getRecommendations();
      if (recRes && recRes.recommendations && recRes.recommendations.length > 0) {
        setCareers(recRes.recommendations);
        setSelectedCareer(recRes.recommendations[0]);
        if (recRes.student_level) {
          setStudentLevel(recRes.student_level);
        }
      }

      // 2. Fetch assessment modules status
      try {
        const modulesData = await assessmentService.getModules();
        if (modulesData && modulesData.length > 0) {
          const mapped: AssessmentOverviewMetric[] = modulesData.map((m) => {
            const isComp = m.status === 'COMPLETED';
            const isProg = m.status === 'IN_PROGRESS';
            let scoreText = 'Pending';
            let val = 0;
            let max = 100;

            if (isComp && m.score !== null) {
              if (m.module_id === 'behavioural' || m.module_id === 'situational') {
                const normalized = (Number(m.score) / 20).toFixed(1);
                scoreText = `${normalized} / 5`;
                val = Number(normalized);
                max = 5;
              } else {
                scoreText = `${Math.round(Number(m.score))}%`;
                val = Math.round(Number(m.score));
                max = 100;
              }
            }

            return {
              id: m.module_id,
              name: m.title.replace(' Assessment', ''),
              scoreText,
              scoreValue: val,
              maxValue: max,
              status: isComp ? 'completed' : isProg ? 'in_progress' : 'not_started',
              icon: m.module_id,
            };
          });
          setMetrics(mapped);
        }
      } catch {
        // Fallback to default metrics
      }

      // 3. Fetch student profile and stream
      try {
        const token = localStorage.getItem('forkora_auth_token');
        const onboardingData = await onboardingService.getExistingProfile(token);
        if (onboardingData) {
          const stream = onboardingData.academic_record?.stream || onboardingData.stream || onboardingData.academic_info?.stream;
          const classLevel = onboardingData.academic_record?.class_level || onboardingData.current_class || onboardingData.academic_info?.current_class;
          if (stream) {
            setStudentStream(stream);
          }
          if (classLevel) {
            setStudentLevel(`Class ${classLevel}`);
          }
        }
      } catch {
        // Keep defaults
      }

      // 4. Fetch student career preferences
      try {
        const prefRes = await careerService.getPreferences();
        if (prefRes) {
          setPreferences(prefRes);
        }
      } catch {
        // Keep defaults
      }
    } catch (err) {
      console.warn('Operating in preview/fallback mode for Career Discovery:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter recommendations by search query
  const filteredCareers = useMemo(() => {
    if (!searchQuery.trim()) return careers;
    const q = searchQuery.toLowerCase().trim();
    return careers.filter(
      (c) =>
        c.career.toLowerCase().includes(q) ||
        (c.domain && c.domain.toLowerCase().includes(q)) ||
        (c.skills && c.skills.some((s) => s.toLowerCase().includes(q)))
    );
  }, [careers, searchQuery]);

  const handleToggleSave = (careerCode: string) => {
    const isSaved = careerService.toggleSaveCareerCode(careerCode);
    setSavedCodes(careerService.getSavedCareerCodes());
  };

  const isCurrentSaved = savedCodes.includes(selectedCareer.career_code);

  const profileTraits = useMemo(() => {
    const traits = ['Analytical & problem-solving', 'Interest in technology & innovation', 'Goal-oriented', 'Adaptable'];
    if (studentStream) {
      traits.unshift(studentStream);
    }
    return traits;
  }, [studentStream]);

  return (
    <AppLayout breadcrumbs={[{ label: 'Career Discovery' }]}>
      <div className="space-y-6 sm:space-y-8 animate-fade-in text-left">
        {/* Top Header */}
        <CareerDiscoveryHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenPreferences={() => setIsPreferencesOpen(true)}
        />

        {/* Personalized Recommendations Banner */}
        <RecommendationsBanner
          studentLevel={studentLevel}
          studentStream={studentStream}
          onUpdatePreferences={() => setIsPreferencesOpen(true)}
        />

        {/* Assessment Summary & Career Profile Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AssessmentSummaryCard metrics={metrics} />
          <CareerProfileCard
            traits={profileTraits}
            interests={preferences.interests}
            workEnvironment={preferences.work_environment}
            onEdit={() => setIsPreferencesOpen(true)}
          />
        </div>

        {/* Main Two-Column Content: Recommended Careers List & Selected Career Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 of 12 cols): Recommended Careers List */}
          <div className="lg:col-span-5">
            <RecommendedCareersList
              careers={filteredCareers}
              selectedCareerCode={selectedCareer.career_code}
              onSelectCareer={(c) => setSelectedCareer(c)}
            />
          </div>

          {/* Right Column (7 of 12 cols): Selected Career Details Panel */}
          <div className="lg:col-span-7">
            <SelectedCareerPanel
              career={selectedCareer}
              isSaved={isCurrentSaved}
              onToggleSave={() => handleToggleSave(selectedCareer.career_code)}
              onOpenCompare={() => setIsCompareOpen(true)}
            />
          </div>
        </div>

        {/* Comparison Modal Dialog */}
        <CareerComparisonModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          baseCareer={selectedCareer}
          allCareers={careers}
        />

        {/* Preferences Modal Dialog */}
        <PreferencesModal
          isOpen={isPreferencesOpen}
          onClose={() => setIsPreferencesOpen(false)}
          initialPreferences={preferences}
          onPreferencesUpdated={loadData}
        />
      </div>
    </AppLayout>
  );
}
export default CareerDiscoveryPage;
