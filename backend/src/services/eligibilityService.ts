import { query } from '../config/db';
import { CareerEligibilityStatus, CareerRule } from '../types/careerTypes';
import { StudentAssessmentContext } from './careerScoringService';

export interface EligibilityEvaluation {
  status: CareerEligibilityStatus;
  reasons: string[];
}

/**
 * Evaluates student eligibility against career and course prerequisites
 */
export async function evaluateEligibility(
  careerNodeId: number,
  careerCode: string,
  context: StudentAssessmentContext
): Promise<EligibilityEvaluation> {
  const reasons: string[] = [];
  let isNotEligible = false;
  let isConditional = false;

  // 1. Fetch rules for this career node and its feeder degrees
  const rulesRes = await query<CareerRule>(
    `SELECT cr.*
     FROM career_rules cr
     WHERE cr.node_id = $1
        OR cr.node_id IN (
          SELECT from_node_id FROM career_edges WHERE to_node_id = $1
        )`,
    [careerNodeId]
  );

  const rules = rulesRes.rows;

  // 2. Class 10 Students: Early Pathway Exploration
  if (context.currentClass <= 10) {
    // Class 10 students have not yet branched into streams. All pathways are potentially open.
    for (const rule of rules) {
      if (rule.rule_type === 'REQUIRED_STREAM' && rule.required_stream) {
        reasons.push(`Can qualify by selecting ${rule.required_stream.replace('_', ' ')} in Class 11`);
        isConditional = true;
      }
      if (rule.rule_type === 'REQUIRED_EXAM') {
        reasons.push(rule.description);
        isConditional = true;
      }
    }

    if (reasons.length === 0) {
      reasons.push('Eligible to pursue this career pathway after Class 10');
    }

    return {
      status: isConditional ? 'conditionally_eligible' : 'eligible',
      reasons,
    };
  }

  // 3. Class 11 & 12 Students: Enforce Academic Stream & Subject Invariants
  const studentStream = (context.stream || '').toUpperCase();
  const enrolledSubjectNames = context.enrolledSubjects.map((s) => s.subject_name.toLowerCase());

  for (const rule of rules) {
    // Rule Check A: Required Stream
    if (rule.rule_type === 'REQUIRED_STREAM' && rule.required_stream) {
      const reqStream = rule.required_stream.toUpperCase();

      if (reqStream === 'SCIENCE_PCM') {
        if (!studentStream.includes('PCM') && !studentStream.includes('SCIENCE') && !studentStream.includes('PCMB')) {
          isNotEligible = true;
          reasons.push(`Requires Science stream with Mathematics (PCM); currently enrolled in ${context.stream || 'non-PCM'}`);
        } else {
          reasons.push('Satisfies required Science (PCM) stream prerequisite');
        }
      } else if (reqStream === 'SCIENCE_PCB') {
        if (!studentStream.includes('PCB') && !studentStream.includes('PCMB') && !enrolledSubjectNames.some((s) => s.includes('bio'))) {
          isNotEligible = true;
          reasons.push(`Requires Science stream with Biology (PCB); currently enrolled in ${context.stream || 'non-medical'}`);
        } else {
          reasons.push('Satisfies required Science (PCB) medical stream prerequisite');
        }
      }
    }

    // Rule Check B: Required Subjects
    if (rule.rule_type === 'REQUIRED_SUBJECTS' && rule.required_subjects?.length > 0) {
      const missing = rule.required_subjects.filter(
        (req) => !enrolledSubjectNames.some((s) => s.includes(req.toLowerCase()))
      );

      if (missing.length > 0) {
        if (rule.is_mandatory) {
          isNotEligible = true;
          reasons.push(`Missing mandatory subject prerequisite: ${missing.join(', ')}`);
        } else {
          isConditional = true;
          reasons.push(`Recommended to study ${missing.join(', ')} for optimal preparation`);
        }
      } else {
        reasons.push(`Possesses required subject background: ${rule.required_subjects.join(', ')}`);
      }
    }

    // Rule Check C: Minimum Aggregate Marks
    if (rule.rule_type === 'MIN_MARKS' || (rule.min_aggregate_marks && rule.min_aggregate_marks > 0)) {
      const minRequired = Number(rule.min_aggregate_marks);

      if (context.enrolledSubjects.length > 0) {
        const totalMarks = context.enrolledSubjects.reduce((acc, s) => acc + s.marks_obtained, 0);
        const totalMax = context.enrolledSubjects.reduce((acc, s) => acc + s.maximum_marks, 0);
        const studentAggregate = totalMax > 0 ? (totalMarks / totalMax) * 100 : 0;

        if (studentAggregate < minRequired) {
          isConditional = true;
          reasons.push(`Current aggregate is ${Math.round(studentAggregate)}%; minimum ${minRequired}% required for competitive entry`);
        } else {
          reasons.push(`Meets academic threshold with ${Math.round(studentAggregate)}% aggregate`);
        }
      }
    }

    // Rule Check D: Required Entrance Exam
    if (rule.rule_type === 'REQUIRED_EXAM') {
      isConditional = true;
      reasons.push(rule.description);
    }
  }

  // 4. Final Status Synthesis
  if (isNotEligible) {
    return {
      status: 'not_eligible',
      reasons: reasons.slice(0, 3),
    };
  }

  if (isConditional) {
    return {
      status: 'conditionally_eligible',
      reasons: reasons.slice(0, 3),
    };
  }

  if (reasons.length === 0) {
    reasons.push('Meets all primary academic and course prerequisites');
  }

  return {
    status: 'eligible',
    reasons: reasons.slice(0, 3),
  };
}
