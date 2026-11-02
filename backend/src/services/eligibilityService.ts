import { query } from '../config/db';
import { CareerEligibilityStatus, CareerRule } from '../types/careerTypes';
import { StudentAssessmentContext } from './careerScoringService';

export interface EligibilityEvaluation {
  status: CareerEligibilityStatus;
  reasons: string[];
}

/**
 * Pure evaluator logic: checks student context against a list of career rules
 * Can be called with rules loaded from DB or directly with test fixtures
 */
export function evaluateRules(
  rules: CareerRule[],
  context: StudentAssessmentContext
): EligibilityEvaluation {
  const criticalReasons: string[] = [];
  const positiveReasons: string[] = [];
  let isNotEligible = false;
  let isConditional = false;

  // 1. Check for Missing Rules
  // A missing rule must never silently produce an eligible result
  if (!rules || rules.length === 0) {
    return {
      status: 'conditionally_eligible',
      reasons: ['Prerequisites and admission criteria for this career require institutional verification'],
    };
  }

  // 2. Class 10 Students: Early Pathway Exploration
  if (context.currentClass <= 10) {
    for (const rule of rules) {
      if (rule.rule_type === 'REQUIRED_STREAM' && rule.required_stream) {
        criticalReasons.push(`Can qualify by selecting ${rule.required_stream.replace('_', ' ')} in Class 11`);
        isConditional = true;
      }
      if (rule.rule_type === 'REQUIRED_EXAM') {
        criticalReasons.push(rule.description);
        isConditional = true;
      }
    }

    if (criticalReasons.length === 0) {
      positiveReasons.push('Eligible to pursue this career pathway after Class 10');
    }

    return {
      status: isConditional ? 'conditionally_eligible' : 'eligible',
      reasons: [...criticalReasons, ...positiveReasons].slice(0, 5),
    };
  }

  // 3. Class 11 & 12 Students: Check for Missing Student Information
  // Missing student information must not be treated as proof of eligibility
  if (!context.stream || context.stream.trim().length === 0) {
    return {
      status: 'conditionally_eligible',
      reasons: ['Academic stream not recorded; stream selection required to verify prerequisite eligibility'],
    };
  }

  if (!context.enrolledSubjects || context.enrolledSubjects.length === 0) {
    return {
      status: 'conditionally_eligible',
      reasons: ['Subject coursework not recorded; enrolled subject verification required'],
    };
  }

  const studentStream = (context.stream || '').toUpperCase();
  const enrolledSubjectNames = context.enrolledSubjects.map((s) => s.subject_name.toLowerCase());

  // 4. Evaluate Defined Rules
  for (const rule of rules) {
    // Condition A: Required Stream
    if (rule.rule_type === 'REQUIRED_STREAM' && rule.required_stream) {
      const reqStream = rule.required_stream.toUpperCase();

      if (reqStream === 'SCIENCE_PCM') {
        if (!studentStream.includes('PCM') && !studentStream.includes('SCIENCE') && !studentStream.includes('PCMB')) {
          isNotEligible = true;
          criticalReasons.push(`Requires Science stream with Mathematics (PCM); currently enrolled in ${context.stream || 'non-PCM'}`);
        } else {
          positiveReasons.push('Satisfies required Science (PCM) stream prerequisite');
        }
      } else if (reqStream === 'SCIENCE_PCB') {
        if (!studentStream.includes('PCB') && !studentStream.includes('PCMB') && !enrolledSubjectNames.some((s) => s.includes('bio'))) {
          isNotEligible = true;
          criticalReasons.push(`Requires Science stream with Biology (PCB); currently enrolled in ${context.stream || 'non-medical'}`);
        } else {
          positiveReasons.push('Satisfies required Science (PCB) medical stream prerequisite');
        }
      } else if (reqStream === 'COMMERCE') {
        if (!studentStream.includes('COMMERCE')) {
          isNotEligible = true;
          criticalReasons.push(`Requires Commerce stream; currently enrolled in ${context.stream || 'non-commerce'}`);
        } else {
          positiveReasons.push('Satisfies required Commerce stream prerequisite');
        }
      }
    }

    // Condition B: Required Subjects
    if (rule.rule_type === 'REQUIRED_SUBJECTS' && rule.required_subjects && rule.required_subjects.length > 0) {
      const missing = rule.required_subjects.filter(
        (req) => !enrolledSubjectNames.some((s) => s.includes(req.toLowerCase()))
      );

      if (missing.length > 0) {
        if (rule.is_mandatory) {
          isNotEligible = true;
          criticalReasons.push(`Missing mandatory subject prerequisite: ${missing.join(', ')}`);
        } else {
          isConditional = true;
          criticalReasons.push(`Recommended to study ${missing.join(', ')} for optimal preparation`);
        }
      } else {
        positiveReasons.push(`Possesses required subject background: ${rule.required_subjects.join(', ')}`);
      }
    }

    // Condition C: Minimum Aggregate Marks
    if (rule.rule_type === 'MIN_MARKS' || (rule.min_aggregate_marks && rule.min_aggregate_marks > 0)) {
      const minRequired = Number(rule.min_aggregate_marks);

      if (context.enrolledSubjects.length > 0) {
        const totalMarks = context.enrolledSubjects.reduce((acc, s) => acc + s.marks_obtained, 0);
        const totalMax = context.enrolledSubjects.reduce((acc, s) => acc + s.maximum_marks, 0);
        const studentAggregate = totalMax > 0 ? (totalMarks / totalMax) * 100 : 0;

        if (studentAggregate < minRequired) {
          isConditional = true;
          criticalReasons.push(`Current aggregate is ${Math.round(studentAggregate)}%; minimum ${minRequired}% required for competitive entry`);
        } else {
          positiveReasons.push(`Meets academic threshold with ${Math.round(studentAggregate)}% aggregate`);
        }
      }
    }

    // Condition D: Required Entrance Exam
    if (rule.rule_type === 'REQUIRED_EXAM') {
      isConditional = true;
      criticalReasons.push(rule.description);
    }
  }

  // 5. Final Status Synthesis
  const combinedReasons = [...criticalReasons, ...positiveReasons];

  if (isNotEligible) {
    return {
      status: 'not_eligible',
      reasons: combinedReasons.slice(0, 5),
    };
  }

  if (isConditional) {
    return {
      status: 'conditionally_eligible',
      reasons: combinedReasons.slice(0, 5),
    };
  }

  if (combinedReasons.length === 0) {
    combinedReasons.push('Meets all primary academic and course prerequisites');
  }

  return {
    status: 'eligible',
    reasons: combinedReasons.slice(0, 5),
  };
}

/**
 * Evaluates student eligibility against career and course prerequisites in the database
 */
export async function evaluateEligibility(
  careerNodeId: number,
  careerCode: string,
  context: StudentAssessmentContext
): Promise<EligibilityEvaluation> {
  // Fetch rules for this career node and its feeder degrees
  const rulesRes = await query<CareerRule>(
    `SELECT cr.*
     FROM career_rules cr
     WHERE cr.node_id = $1
        OR cr.node_id IN (
          SELECT from_node_id FROM career_edges WHERE to_node_id = $1
        )`,
    [careerNodeId]
  );

  return evaluateRules(rulesRes.rows, context);
}
