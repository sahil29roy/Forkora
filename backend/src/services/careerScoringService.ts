import { query } from '../config/db';
import { CareerNode, CareerScoreBreakdown } from '../types/careerTypes';
import { getOrComputeMLPredictions } from './mlPredictionService';

export interface StudentAssessmentContext {
  userId: number | string;
  currentClass: number;
  stream: string | null;
  enrolledSubjects: { subject_name: string; marks_obtained: number; maximum_marks: number }[];
  interests: string[];
  preferredCareers: string[];
  workEnvironment: string;
  careerType: string;
  preferredLocation: string;
  mlPredictions: Record<string, number>;
  academicResult?: {
    score_percentage: number;
    subject_performance?: Record<string, { total: number; correct: number; percentage: number }>;
  } | null;
  aptitudeResult?: {
    score_percentage: number;
    topic_performance?: Record<string, { total: number; correct: number; percentage: number }>;
  } | null;
  behaviouralResult?: {
    dimension_averages?: Record<string, number>; // 1.0 to 5.0
  } | null;
  situationalResult?: {
    behavioural_signals?: Record<string, number>; // 1.0 to 5.0
  } | null;
}

export interface CareerScoreResult {
  career: string;
  careerCode: string;
  careerNodeId: number;
  compatibilityScore: number;
  breakdown: CareerScoreBreakdown;
  reasons: string[];
}

/**
 * Weights by student academic level according to project requirements:
 * Component    Class 10    Class 12
 * ML model     25%         30%
 * Academic     15%         25%
 * Aptitude     20%         12%
 * Behavioural  20%         13%
 * Situational  10%         10%
 * Preferences  10%         10%
 */
const CLASS_10_WEIGHTS = {
  ml: 0.25,
  academic: 0.15,
  aptitude: 0.20,
  behavioural: 0.20,
  situational: 0.10,
  preferences: 0.10,
};

const CLASS_12_WEIGHTS = {
  ml: 0.30,
  academic: 0.25,
  aptitude: 0.12,
  behavioural: 0.13,
  situational: 0.10,
  preferences: 0.10,
};

/**
 * Career-specific behavioural dimension weight profiles
 */
const CAREER_BEHAVIOURAL_PROFILES: Record<string, Record<string, number>> = {
  CAREER_SOFTWARE_ENGINEER: {
    'Problem-solving and critical thinking': 0.35,
    'Independence and initiative': 0.25,
    'Learning and work preferences': 0.25,
    'Creativity and curiosity': 0.15,
  },
  CAREER_DATA_SCIENTIST: {
    'Problem-solving and critical thinking': 0.40,
    'Creativity and curiosity': 0.25,
    'Independence and initiative': 0.20,
    'Learning and work preferences': 0.15,
  },
  CAREER_CYBERSECURITY: {
    'Problem-solving and critical thinking': 0.35,
    'Independence and initiative': 0.30,
    'Adaptability and resilience': 0.20,
    'Learning and work preferences': 0.15,
  },
  CAREER_DOCTOR: {
    'Problem-solving and critical thinking': 0.30,
    'Adaptability and resilience': 0.30,
    'Teamwork and communication': 0.25,
    'Learning and work preferences': 0.15,
  },
  CAREER_BIOTECHNOLOGIST: {
    'Creativity and curiosity': 0.35,
    'Problem-solving and critical thinking': 0.30,
    'Independence and initiative': 0.20,
    'Learning and work preferences': 0.15,
  },
  CAREER_CHARTERED_ACCOUNTANT: {
    'Problem-solving and critical thinking': 0.35,
    'Independence and initiative': 0.30,
    'Adaptability and resilience': 0.20,
    'Teamwork and communication': 0.15,
  },
  CAREER_INVESTMENT_BANKER: {
    'Problem-solving and critical thinking': 0.35,
    'Adaptability and resilience': 0.25,
    'Independence and initiative': 0.20,
    'Teamwork and communication': 0.20,
  },
  CAREER_PRODUCT_MANAGER: {
    'Teamwork and communication': 0.35,
    'Creativity and curiosity': 0.25,
    'Problem-solving and critical thinking': 0.25,
    'Adaptability and resilience': 0.15,
  },
  CAREER_CORPORATE_LAWYER: {
    'Teamwork and communication': 0.35,
    'Problem-solving and critical thinking': 0.30,
    'Independence and initiative': 0.20,
    'Adaptability and resilience': 0.15,
  },
  CAREER_CIVIL_SERVANT: {
    'Adaptability and resilience': 0.30,
    'Problem-solving and critical thinking': 0.25,
    'Teamwork and communication': 0.25,
    'Independence and initiative': 0.20,
  },
  CAREER_CLINICAL_PSYCHOLOGIST: {
    'Teamwork and communication': 0.40,
    'Adaptability and resilience': 0.30,
    'Creativity and curiosity': 0.15,
    'Problem-solving and critical thinking': 0.15,
  },
  CAREER_UI_UX_DESIGNER: {
    'Creativity and curiosity': 0.40,
    'Teamwork and communication': 0.25,
    'Problem-solving and critical thinking': 0.20,
    'Adaptability and resilience': 0.15,
  },
};

/**
 * Loads student academic and assessment context from database
 */
export async function loadStudentContext(userId: number | string): Promise<StudentAssessmentContext> {
  // 1. Load Student Profile & Preferences
  const profileRes = await query(
    `SELECT sp.*, ar.stream AS enrolled_stream
     FROM student_profiles sp
     LEFT JOIN academic_records ar ON ar.student_profile_id = sp.id
     WHERE sp.user_id = $1
     ORDER BY sp.id DESC LIMIT 1`,
    [userId]
  );

  const profile = profileRes.rows[0] || {};
  const currentClass = Number(profile.current_class || 10);
  const stream = profile.enrolled_stream || profile.stream || null;

  // 2. Load Enrolled School Subjects & Marks
  const subjectsRes = await query(
    `SELECT subject_name, marks_obtained, maximum_marks
     FROM academic_subjects asub
     JOIN academic_records ar ON asub.academic_record_id = ar.id
     JOIN student_profiles sp ON ar.student_profile_id = sp.id
     WHERE sp.user_id = $1`,
    [userId]
  );

  const enrolledSubjects = subjectsRes.rows.map((r: any) => ({
    subject_name: r.subject_name,
    marks_obtained: Number(r.marks_obtained),
    maximum_marks: Number(r.maximum_marks),
  }));

  // 3. Load Completed Assessment Results
  const resultsRes = await query(
    `SELECT module_id, score_percentage, summary
     FROM assessment_results
     WHERE user_id = $1`,
    [userId]
  );

  let academicResult: any = null;
  let aptitudeResult: any = null;
  let behaviouralResult: any = null;
  let situationalResult: any = null;

  for (const row of resultsRes.rows) {
    if (row.module_id === 'academic') {
      academicResult = {
        score_percentage: Number(row.score_percentage),
        subject_performance: row.summary?.subject_performance || {},
      };
    } else if (row.module_id === 'aptitude') {
      aptitudeResult = {
        score_percentage: Number(row.score_percentage),
        topic_performance: row.summary?.topic_performance || {},
      };
    } else if (row.module_id === 'behavioural') {
      behaviouralResult = {
        dimension_averages: row.summary?.dimension_averages || {},
      };
    } else if (row.module_id === 'situational') {
      situationalResult = {
        behavioural_signals: row.summary?.behavioural_signals || {},
      };
    }
  }

  return {
    userId,
    currentClass,
    stream,
    enrolledSubjects,
    interests: profile.interests || [],
    preferredCareers: profile.preferred_careers || [],
    workEnvironment: profile.work_environment || 'No preference',
    careerType: profile.career_type || 'No preference',
    preferredLocation: profile.preferred_location || 'No preference',
    mlPredictions: profile.ml_predictions || {},
    academicResult,
    aptitudeResult,
    behaviouralResult,
    situationalResult,
  };
}

/**
 * Calculates academic score (0-100) based on relevant subject assessment accuracy and school marks
 */
function calculateAcademicScore(
  node: CareerNode,
  context: StudentAssessmentContext,
  reasons: string[]
): number {
  const relevant = (node.relevant_subjects || []).map((s) => s.toLowerCase());
  let assessmentScore: number | null = null;
  let schoolMarksScore: number | null = null;

  // 1. From Assessment Results (Subject-wise accuracy)
  if (context.academicResult?.subject_performance) {
    const perf = context.academicResult.subject_performance;
    let matchingTotal = 0;
    let matchingCorrect = 0;

    for (const [subjName, data] of Object.entries(perf)) {
      if (relevant.some((r) => subjName.toLowerCase().includes(r) || r.includes(subjName.toLowerCase()))) {
        matchingTotal += data.total;
        matchingCorrect += data.correct;
      }
    }

    if (matchingTotal > 0) {
      assessmentScore = Math.round((matchingCorrect / matchingTotal) * 100);
      if (assessmentScore >= 70) {
        reasons.push(`Strong academic assessment accuracy in ${node.relevant_subjects?.slice(0, 2).join(' & ')}`);
      }
    } else {
      assessmentScore = context.academicResult.score_percentage || 65;
    }
  }

  // 2. From School Reported Subject Marks
  if (context.enrolledSubjects.length > 0) {
    let sumMarks = 0;
    let sumMax = 0;

    for (const sub of context.enrolledSubjects) {
      if (relevant.some((r) => sub.subject_name.toLowerCase().includes(r) || r.includes(sub.subject_name.toLowerCase()))) {
        sumMarks += sub.marks_obtained;
        sumMax += sub.maximum_marks;
      }
    }

    if (sumMax > 0) {
      schoolMarksScore = Math.round((sumMarks / sumMax) * 100);
      if (schoolMarksScore >= 75) {
        reasons.push(`High academic performance in relevant coursework (${schoolMarksScore}%)`);
      }
    }
  }

  if (assessmentScore !== null && schoolMarksScore !== null) {
    return Math.round(assessmentScore * 0.6 + schoolMarksScore * 0.4);
  }
  if (assessmentScore !== null) return assessmentScore;
  if (schoolMarksScore !== null) return schoolMarksScore;
  return 65; // Baseline neutral score
}

/**
 * Calculates aptitude score (0-100) based on reasoning assessment results
 */
function calculateAptitudeScore(
  node: CareerNode,
  context: StudentAssessmentContext,
  reasons: string[]
): number {
  if (!context.aptitudeResult) {
    return 65; // Baseline neutral score
  }

  const overall = context.aptitudeResult.score_percentage || 65;
  const topics = context.aptitudeResult.topic_performance || {};

  // For technical and mathematical careers, prioritize numerical and logical reasoning
  const code = node.code;
  let weightedScore = overall;

  if (
    code === 'CAREER_SOFTWARE_ENGINEER' ||
    code === 'CAREER_DATA_SCIENTIST' ||
    code === 'CAREER_CHARTERED_ACCOUNTANT' ||
    code === 'CAREER_INVESTMENT_BANKER'
  ) {
    const num = topics['Numerical Reasoning']?.percentage ?? topics['Numerical']?.percentage;
    const log = topics['Logical Reasoning']?.percentage ?? topics['Logical']?.percentage;

    if (num !== undefined && log !== undefined) {
      weightedScore = Math.round(num * 0.5 + log * 0.5);
    } else if (num !== undefined) {
      weightedScore = Math.round(num * 0.6 + overall * 0.4);
    } else if (log !== undefined) {
      weightedScore = Math.round(log * 0.6 + overall * 0.4);
    }
  }

  if (weightedScore >= 75) {
    reasons.push('High aptitude in problem-solving and analytical reasoning');
  }

  return Math.min(100, Math.max(0, weightedScore));
}

/**
 * Calculates behavioural score (0-100) mapping 6 dimensions to career requirements
 */
function calculateBehaviouralScore(
  node: CareerNode,
  context: StudentAssessmentContext,
  reasons: string[]
): number {
  if (!context.behaviouralResult?.dimension_averages) {
    return 68; // Baseline neutral score
  }

  const dims = context.behaviouralResult.dimension_averages;
  const profile = CAREER_BEHAVIOURAL_PROFILES[node.code] || {
    'Problem-solving and critical thinking': 0.25,
    'Creativity and curiosity': 0.20,
    'Teamwork and communication': 0.20,
    'Independence and initiative': 0.15,
    'Adaptability and resilience': 0.20,
  };

  let totalWeight = 0;
  let totalScore = 0;

  for (const [dimName, weight] of Object.entries(profile)) {
    const avg = dims[dimName] ?? 3.0; // 1.0 to 5.0
    // Scale 1.0..5.0 to 0..100
    const scaled = Math.min(100, Math.max(0, ((avg - 1) / 4) * 100));
    totalScore += scaled * weight;
    totalWeight += weight;
  }

  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 68;

  if (finalScore >= 75) {
    reasons.push('Natural alignment with behavioural tendencies and working style');
  }

  return finalScore;
}

/**
 * Calculates situational score (0-100) from decision-making signals
 */
function calculateSituationalScore(
  node: CareerNode,
  context: StudentAssessmentContext,
  reasons: string[]
): number {
  if (!context.situationalResult?.behavioural_signals) {
    return 70; // Baseline neutral score
  }

  const signals = context.situationalResult.behavioural_signals;
  let sum = 0;
  let count = 0;

  for (const val of Object.values(signals)) {
    if (typeof val === 'number') {
      // 1.0 to 5.0 scaled to 0-100
      sum += ((val - 1) / 4) * 100;
      count++;
    }
  }

  const avgScore = count > 0 ? Math.round(sum / count) : 70;

  if (avgScore >= 75) {
    reasons.push('Strong situational decision-making and practical judgment');
  }

  return Math.min(100, Math.max(0, avgScore));
}

/**
 * Calculates preferences score (0-100) based on student career choices, interests, and work preferences
 */
function calculatePreferencesScore(
  node: CareerNode,
  context: StudentAssessmentContext,
  reasons: string[]
): number {
  let score = 50; // Start at midpoint

  const prefList = (context.preferredCareers || []).map((c) => c.toLowerCase().trim());
  const careerTitle = node.title.toLowerCase().trim();

  // 1. Direct Career Choice Match
  if (prefList.length > 0) {
    if (prefList[0] && (careerTitle.includes(prefList[0]) || prefList[0].includes(careerTitle))) {
      score += 40;
      reasons.push('Matches first career preference');
    } else if (prefList[1] && (careerTitle.includes(prefList[1]) || prefList[1].includes(careerTitle))) {
      score += 30;
      reasons.push('Matches second career preference');
    } else if (prefList[2] && (careerTitle.includes(prefList[2]) || prefList[2].includes(careerTitle))) {
      score += 20;
      reasons.push('Matches third career preference');
    }
  }

  // 2. Stream / Interest Categories Match
  const interests = (context.interests || []).map((i) => i.toUpperCase());
  if (interests.length > 0) {
    if (
      (interests.includes('SCIENCE_PCM') || interests.includes('SCIENCE_PCMB') || interests.includes('TECHNOLOGY & COMPUTERS')) &&
      node.stream.includes('SCIENCE_PCM')
    ) {
      score += 15;
      reasons.push('Directly aligns with selected technical stream preferences');
    } else if (
      (interests.includes('SCIENCE_PCB') || interests.includes('HEALTHCARE & MEDICINE')) &&
      node.stream.includes('SCIENCE_PCB')
    ) {
      score += 15;
      reasons.push('Directly aligns with selected medical & life sciences preferences');
    } else if (
      (interests.includes('COMMERCE_WITH_MATH') || interests.includes('COMMERCE_WITHOUT_MATH') || interests.includes('BUSINESS & ENTREPRENEURSHIP')) &&
      node.stream.includes('COMMERCE')
    ) {
      score += 15;
      reasons.push('Directly aligns with selected commerce and business preferences');
    } else if (
      (interests.includes('ARTS_HUMANITIES') || interests.includes('LAW & JUSTICE') || interests.includes('MEDIA & COMMUNICATION')) &&
      (node.stream.includes('HUMANITIES') || node.stream === 'ANY')
    ) {
      score += 15;
      reasons.push('Directly aligns with selected humanities & public affairs preferences');
    }
  }

  // 3. Work Environment & Career Type Match
  if (context.careerType && context.careerType !== 'No preference') {
    if (context.careerType.includes('Technical') && node.stream.includes('SCIENCE_PCM')) {
      score += 10;
    } else if (context.careerType.includes('Creative') && (node.code.includes('DESIGNER') || node.code.includes('MARKETING'))) {
      score += 10;
    } else if (context.careerType.includes('People') && (node.code.includes('PSYCHOLOGIST') || node.code.includes('MANAGER'))) {
      score += 10;
    } else if (context.careerType.includes('Public') && (node.code.includes('CIVIL_SERVANT') || node.code.includes('LAWYER'))) {
      score += 10;
    }
  }

  return Math.min(100, Math.max(20, score));
}

/**
 * Calculates historical / deterministic ML baseline prediction score (0-100)
 */
function calculateMLScore(
  node: CareerNode,
  context: StudentAssessmentContext,
  reasons: string[]
): number {
  // If actual ML prediction exists in student context, use it
  if (context.mlPredictions && typeof context.mlPredictions[node.code] === 'number') {
    const mlVal = context.mlPredictions[node.code];
    if (mlVal >= 75) {
      reasons.push('High predictive suitability from historical career exploration models');
    }
    return Math.min(100, Math.max(0, mlVal));
  }

  // Deterministic algorithmic baseline model:
  // Combines student's class, stream alignment, aggregate academic baseline, and archetype compatibility
  let baseline = 68;

  // Stream matching bonus
  if (context.stream) {
    const s = context.stream.toUpperCase();
    if (s.includes('SCIENCE') && node.stream.includes('SCIENCE')) {
      baseline += 14;
    } else if (s.includes('COMMERCE') && node.stream.includes('COMMERCE')) {
      baseline += 14;
    } else if (s.includes('HUMANITIES') && (node.stream.includes('HUMANITIES') || node.stream === 'ANY')) {
      baseline += 12;
    }
  }

  // Marks bonus
  if (context.enrolledSubjects.length > 0) {
    const avg =
      context.enrolledSubjects.reduce((acc, sub) => acc + (sub.marks_obtained / sub.maximum_marks) * 100, 0) /
      context.enrolledSubjects.length;
    baseline += Math.round((avg - 70) * 0.2);
  }

  return Math.min(96, Math.max(45, baseline));
}

/**
 * Main career scoring service calculating and ranking career compatibility
 */
export async function calculateCareerScores(
  userId: number | string
): Promise<CareerScoreResult[]> {
  const context = await loadStudentContext(userId);

  // If ML predictions are not yet computed, dynamically query Python ML predictor
  if (!context.mlPredictions || Object.keys(context.mlPredictions).length === 0) {
    context.mlPredictions = await getOrComputeMLPredictions(context);
  }

  // Load all published career nodes
  const nodesRes = await query<CareerNode>(
    `SELECT * FROM career_nodes
     WHERE node_type = 'CAREER' AND is_published = true
     ORDER BY id ASC`
  );

  const careerNodes = nodesRes.rows;
  const weights = context.currentClass <= 10 ? CLASS_10_WEIGHTS : CLASS_12_WEIGHTS;

  const results: CareerScoreResult[] = [];

  for (const node of careerNodes) {
    const reasons: string[] = [];

    const academicScore = calculateAcademicScore(node, context, reasons);
    const aptitudeScore = calculateAptitudeScore(node, context, reasons);
    const behaviouralScore = calculateBehaviouralScore(node, context, reasons);
    const situationalScore = calculateSituationalScore(node, context, reasons);
    const preferencesScore = calculatePreferencesScore(node, context, reasons);
    const mlScore = calculateMLScore(node, context, reasons);

    const compatibilityScore = Math.round(
      mlScore * weights.ml +
        academicScore * weights.academic +
        aptitudeScore * weights.aptitude +
        behaviouralScore * weights.behavioural +
        situationalScore * weights.situational +
        preferencesScore * weights.preferences
    );

    // Dedup reasons and cap at 3-4 concise insights
    const uniqueReasons = Array.from(new Set(reasons)).slice(0, 3);
    if (uniqueReasons.length === 0) {
      uniqueReasons.push('Comprehensive compatibility across academic, cognitive, and personality profiles');
    }

    results.push({
      career: node.title,
      careerCode: node.code,
      careerNodeId: node.id,
      compatibilityScore: Math.min(100, Math.max(0, compatibilityScore)),
      breakdown: {
        ml_score: mlScore,
        academic_score: academicScore,
        aptitude_score: aptitudeScore,
        behavioural_score: behaviouralScore,
        situational_score: situationalScore,
        preferences_score: preferencesScore,
        weights,
      },
      reasons: uniqueReasons,
    });
  }

  // Sort descending by compatibility score
  results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return results;
}
