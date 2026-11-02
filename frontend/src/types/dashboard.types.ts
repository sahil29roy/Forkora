import type { CareerRecommendationItem } from './career.types';
import type { ModuleProgressDTO } from './assessment.types';

export type JourneyStageStatus = 'completed' | 'in_progress' | 'not_started' | 'available';

export interface JourneyStage {
  step: number;
  id: string;
  title: string;
  subtitle: string;
  status: JourneyStageStatus;
  href: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  type: 'career' | 'pathway' | 'comparison' | 'assessment';
  timestamp: string;
  href: string;
}

export interface DashboardSummaryData {
  studentName: string;
  studentLevel: string;
  studentStream: string | null;
  profileCompletion: number;
  modules: ModuleProgressDTO[];
  topCareer: CareerRecommendationItem | null;
  totalRecommendationsCount: number;
  savedCareersCount: number;
  savedPathsCount: number;
  comparisonsCount: number;
  interests: string[];
  goal: string;
  careerPreferences: string[];
  recentActivities: RecentActivityItem[];
}
