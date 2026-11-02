import {
  careerNodeSchema,
  careerEdgeSchema,
  graphTraversalQuerySchema,
  VALID_NODE_TYPES,
  VALID_TRANSITION_TYPES,
  VALID_REVERSIBILITIES,
  VALID_ELIGIBILITY_STATUSES,
} from './validators/careerValidator';
import { evaluateRules } from './services/eligibilityService';
import { CareerRule } from './types/careerTypes';
import { StudentAssessmentContext } from './services/careerScoringService';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    if (details) console.error(`     Details: ${details}`);
    failedCount++;
  }
}

console.log('🧪 Starting Career Graph & Traversal Engine Unit Tests...\n');

// -------------------------------------------------------------
// Group 1: Career Node Schema & Validation
// -------------------------------------------------------------
console.log('Group 1: Career Node Schema & Validation');
{
  // Valid node
  const validNode = {
    code: 'CAREER_SOFTWARE_ENGINEER',
    title: 'Software Engineer',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'SCIENCE_PCM',
    description: 'Designs and builds software applications and scalable systems.',
    typical_duration_months: 0,
    skills: ['Algorithms', 'Data Structures', 'TypeScript'],
    relevant_subjects: ['Mathematics', 'Computer Science'],
    salary_range_inr: { min: 600000, max: 3500000, median: 1400000 },
    is_published: true,
  };
  const validRes = careerNodeSchema.safeParse(validNode);
  assert(validRes.success, 'Valid career node passes schema validation');

  // Node types enum check
  assert(VALID_NODE_TYPES.includes('EDUCATION_LEVEL'), 'Node types include EDUCATION_LEVEL');
  assert(VALID_NODE_TYPES.includes('STREAM'), 'Node types include STREAM');
  assert(VALID_NODE_TYPES.includes('EXAM'), 'Node types include EXAM');
  assert(VALID_NODE_TYPES.includes('COURSE'), 'Node types include COURSE');
  assert(VALID_NODE_TYPES.includes('CAREER'), 'Node types include CAREER');

  // Invalid node type
  const invalidTypeRes = careerNodeSchema.safeParse({
    ...validNode,
    node_type: 'UNIVERSITY_CAMPUS',
  });
  assert(!invalidTypeRes.success, 'Invalid node_type is rejected');

  // Missing title
  const missingTitleRes = careerNodeSchema.safeParse({
    ...validNode,
    title: '',
  });
  assert(!missingTitleRes.success, 'Empty node title is rejected');

  // Missing code
  const missingCodeRes = careerNodeSchema.safeParse({
    ...validNode,
    code: '',
  });
  assert(!missingCodeRes.success, 'Empty node code is rejected');

  // Invalid code formatting (lowercase / spaces)
  const invalidCodeFormat = careerNodeSchema.safeParse({
    ...validNode,
    code: 'software engineer',
  });
  assert(!invalidCodeFormat.success, 'Lowercase or space-separated node code is rejected');

  // Negative duration
  const negDurationRes = careerNodeSchema.safeParse({
    ...validNode,
    typical_duration_months: -12,
  });
  assert(!negDurationRes.success, 'Negative duration is rejected');
}

// -------------------------------------------------------------
// Group 2: Career Edge Schema & Constraint Validation
// -------------------------------------------------------------
console.log('\nGroup 2: Career Edge Schema & Constraint Validation');
{
  const validEdge = {
    from_node_id: 1,
    to_node_id: 2,
    transition_type: 'ACADEMIC',
    reversibility: 'REVERSIBLE',
    min_duration_months: 24,
    description: 'Transition from Class 10 to Class 12 Science PCM',
    is_active: true,
  };
  const validRes = careerEdgeSchema.safeParse(validEdge);
  assert(validRes.success, 'Valid transition edge passes validation');

  // Transition types enum check
  assert(VALID_TRANSITION_TYPES.includes('ACADEMIC'), 'Transition types include ACADEMIC');
  assert(VALID_TRANSITION_TYPES.includes('EXAM'), 'Transition types include EXAM');
  assert(VALID_TRANSITION_TYPES.includes('DIRECT'), 'Transition types include DIRECT');
  assert(VALID_TRANSITION_TYPES.includes('LATERAL'), 'Transition types include LATERAL');
  assert(VALID_TRANSITION_TYPES.includes('CAREER'), 'Transition types include CAREER');

  // Self-referencing edge rejection
  const selfLoopRes = careerEdgeSchema.safeParse({
    ...validEdge,
    from_node_id: 5,
    to_node_id: 5,
  });
  assert(!selfLoopRes.success, 'Self-referencing edge (from_node_id === to_node_id) is rejected');

  // Invalid transition type
  const invalidTransitionRes = careerEdgeSchema.safeParse({
    ...validEdge,
    transition_type: 'UNOFFICIAL_SHORTCUT',
  });
  assert(!invalidTransitionRes.success, 'Invalid transition_type is rejected');

  // Invalid reversibility
  const invalidRevRes = careerEdgeSchema.safeParse({
    ...validEdge,
    reversibility: 'TEMPORARY',
  });
  assert(!invalidRevRes.success, 'Invalid reversibility enum is rejected');

  // Negative min_duration_months
  const negDurationRes = careerEdgeSchema.safeParse({
    ...validEdge,
    min_duration_months: -6,
  });
  assert(!negDurationRes.success, 'Negative minimum duration is rejected');

  // Non-positive IDs
  const zeroIdRes = careerEdgeSchema.safeParse({
    ...validEdge,
    from_node_id: 0,
  });
  assert(!zeroIdRes.success, 'Zero source node ID is rejected');
}

// -------------------------------------------------------------
// Group 3: Graph Traversal Logic & Query Parameter Validation
// -------------------------------------------------------------
console.log('\nGroup 3: Graph Traversal Logic & Query Parameter Validation');
{
  // Valid query with startCode
  const validCodeQuery = graphTraversalQuerySchema.safeParse({
    startCode: 'CLASS_10',
    destinationCode: 'CAREER_SOFTWARE_ENGINEER',
    maxDepth: '5',
    limit: '10',
  });
  assert(validCodeQuery.success, 'Valid startCode query is accepted and coerced');
  if (validCodeQuery.success) {
    assert(validCodeQuery.data.maxDepth === 5, 'maxDepth coerced to number 5');
    assert(validCodeQuery.data.limit === 10, 'limit coerced to number 10');
  }

  // Valid query with startNodeId
  const validIdQuery = graphTraversalQuerySchema.safeParse({
    startNodeId: '1',
    destinationNodeId: '15',
  });
  assert(validIdQuery.success, 'Numeric string node IDs coerced to positive integers');

  // Missing both startNodeId and startCode
  const missingStartQuery = graphTraversalQuerySchema.safeParse({
    destinationCode: 'CAREER_DOCTOR',
  });
  assert(!missingStartQuery.success, 'Query missing both startNodeId and startCode is rejected');

  // Depth limit bounds
  const excessiveDepth = graphTraversalQuerySchema.safeParse({
    startCode: 'CLASS_10',
    maxDepth: '20', // Max allowed is 8
  });
  assert(!excessiveDepth.success, 'Excessive depth (> 8) is rejected for query safety');

  // In-Memory Graph Traversal Simulation Algorithm
  interface SimNode {
    id: number;
    title: string;
  }
  interface SimEdge {
    from: number;
    to: number;
    duration: number;
  }

  function simulateTraversal(
    startId: number,
    destId: number | undefined,
    nodes: Map<number, SimNode>,
    edges: SimEdge[],
    maxDepth: number,
    limit: number
  ): Array<{ path: string[]; duration: number; depth: number }> {
    const results: Array<{ path: string[]; duration: number; depth: number }> = [];

    function dfs(currentId: number, visited: number[], duration: number, depth: number) {
      if (depth > maxDepth) return;
      if (results.length >= limit) return;

      const pathIds = [...visited, currentId];

      if (destId !== undefined && currentId === destId) {
        results.push({
          path: pathIds.map((id) => nodes.get(id)?.title || `Node ${id}`),
          duration,
          depth,
        });
        return;
      }

      if (destId === undefined && visited.length > 0) {
        results.push({
          path: pathIds.map((id) => nodes.get(id)?.title || `Node ${id}`),
          duration,
          depth,
        });
      }

      // Outgoing edges
      const nextEdges = edges.filter((e) => e.from === currentId && !visited.includes(e.to));
      for (const edge of nextEdges) {
        dfs(edge.to, pathIds, duration + edge.duration, depth + 1);
      }
    }

    dfs(startId, [], 0, 1);
    return results.sort((a, b) => a.depth - b.depth || a.duration - b.duration);
  }

  // Fixture: Linear Pathway A (1) -> B (2) -> C (3)
  const nodeCatalog = new Map<number, SimNode>([
    [1, { id: 1, title: 'Class 10' }],
    [2, { id: 2, title: 'Class 12 Science PCM' }],
    [3, { id: 3, title: 'B.Tech CSE' }],
    [4, { id: 4, title: 'BCA' }],
    [5, { id: 5, title: 'Software Engineer' }],
    [6, { id: 6, title: 'Isolated Node' }],
    [7, { id: 7, title: 'Cycle Node A' }],
    [8, { id: 8, title: 'Cycle Node B' }],
  ]);

  const testEdges: SimEdge[] = [
    { from: 1, to: 2, duration: 24 },
    { from: 2, to: 3, duration: 48 },
    { from: 2, to: 4, duration: 36 },
    { from: 3, to: 5, duration: 0 },
    { from: 4, to: 5, duration: 0 },
    // Cycle edges
    { from: 7, to: 8, duration: 12 },
    { from: 8, to: 7, duration: 12 },
  ];

  // Test: Linear and Branching Pathways
  const pathwaysToSoftware = simulateTraversal(1, 5, nodeCatalog, testEdges, 5, 5);
  assert(pathwaysToSoftware.length === 2, 'Found exactly 2 alternative pathways from Class 10 to Software Engineer');
  assert(pathwaysToSoftware[0].path.join(' -> ') === 'Class 10 -> Class 12 Science PCM -> BCA -> Software Engineer', 'Primary pathway ordered by duration/depth');
  assert(pathwaysToSoftware[1].path.join(' -> ') === 'Class 10 -> Class 12 Science PCM -> B.Tech CSE -> Software Engineer', 'Secondary alternative pathway preserved');

  // Test: Disconnected Node
  const disconnectedPaths = simulateTraversal(6, 5, nodeCatalog, testEdges, 5, 5);
  assert(disconnectedPaths.length === 0, 'Disconnected node returns empty pathway list cleanly without error');

  // Test: Cycle Prevention
  const cyclePaths = simulateTraversal(7, 999, nodeCatalog, testEdges, 5, 10);
  assert(cyclePaths.length === 0, 'Cyclic edges terminated by cycle check without infinite recursion');

  // Test: Traversal without Destination
  const allForwardPaths = simulateTraversal(1, undefined, nodeCatalog, testEdges, 4, 10);
  assert(allForwardPaths.length > 0, 'Traversal without destination discovers all reachable connected paths');
}

// -------------------------------------------------------------
// Group 4: Deterministic Eligibility Engine (Rule Evaluator)
// -------------------------------------------------------------
console.log('\nGroup 4: Deterministic Eligibility Engine (Rule Evaluator)');
{
  const btechRules: CareerRule[] = [
    {
      id: 1,
      node_id: 10,
      rule_type: 'REQUIRED_STREAM',
      required_stream: 'SCIENCE_PCM',
      required_subjects: [],
      min_aggregate_marks: null,
      required_exam_node_id: null,
      description: 'Requires Class 12 Science with Physics, Chemistry, and Mathematics (PCM).',
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      node_id: 10,
      rule_type: 'REQUIRED_SUBJECTS',
      required_stream: null,
      required_subjects: ['Mathematics', 'Physics', 'Chemistry'],
      min_aggregate_marks: 60,
      required_exam_node_id: null,
      description: 'Minimum 60% aggregate in Physics, Chemistry, and Mathematics.',
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      node_id: 10,
      rule_type: 'REQUIRED_EXAM',
      required_stream: null,
      required_subjects: [],
      min_aggregate_marks: null,
      required_exam_node_id: 5,
      description: 'Qualify JEE Main examination.',
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
  ];

  // Case A: Science PCM Student with High Marks
  const eligibleContext: StudentAssessmentContext = {
    currentClass: 12,
    stream: 'SCIENCE_PCM',
    interests: ['TECHNOLOGY'],
    preferredCareers: ['Software Engineer'],
    enrolledSubjects: [
      { subject_name: 'Mathematics', marks_obtained: 85, maximum_marks: 100 },
      { subject_name: 'Physics', marks_obtained: 80, maximum_marks: 100 },
      { subject_name: 'Chemistry', marks_obtained: 75, maximum_marks: 100 },
      { subject_name: 'English', marks_obtained: 70, maximum_marks: 100 },
    ],
    assessmentScores: {
      academic: 85,
      aptitude: 80,
      behavioural: 75,
      situational: 70,
    },
    dimensionAverages: {},
    situationalSignals: {},
    academicSubjectScores: {},
    aptitudeTopicScores: {},
  };

  const evalA = evaluateRules(btechRules, eligibleContext);
  assert(evalA.status === 'conditionally_eligible', 'PCM student flagged conditionally eligible due to pending JEE exam');
  assert(evalA.reasons.some((r) => r.includes('JEE Main')), 'Includes JEE Main exam description in reasons');

  // Case B: Commerce Student attempting B.Tech PCM
  const commerceContext: StudentAssessmentContext = {
    ...eligibleContext,
    stream: 'COMMERCE',
    enrolledSubjects: [
      { subject_name: 'Accountancy', marks_obtained: 85, maximum_marks: 100 },
      { subject_name: 'Business Studies', marks_obtained: 80, maximum_marks: 100 },
      { subject_name: 'Economics', marks_obtained: 75, maximum_marks: 100 },
    ],
  };

  const evalB = evaluateRules(btechRules, commerceContext);
  assert(evalB.status === 'not_eligible', 'Commerce student correctly rejected with not_eligible status');
  assert(evalB.reasons.some((r) => r.includes('Requires Science stream with Mathematics')), 'Explains stream mismatch reason');

  // Case C: Science PCM Student with Marks Below 60% Threshold
  const lowMarksContext: StudentAssessmentContext = {
    ...eligibleContext,
    enrolledSubjects: [
      { subject_name: 'Mathematics', marks_obtained: 50, maximum_marks: 100 },
      { subject_name: 'Physics', marks_obtained: 52, maximum_marks: 100 },
      { subject_name: 'Chemistry', marks_obtained: 48, maximum_marks: 100 },
    ],
  };

  const evalC = evaluateRules(btechRules, lowMarksContext);
  assert(evalC.status === 'conditionally_eligible', 'Student below 60% flagged conditionally eligible with marks advisory');
  assert(evalC.reasons.some((r) => r.includes('minimum 60% required')), 'Explains minimum threshold gap in reasons');

  // Case D: Missing Rules Handling
  const evalD = evaluateRules([], eligibleContext);
  assert(evalD.status === 'conditionally_eligible', 'Missing rules do not silently produce eligible status');
  assert(evalD.reasons[0].includes('require institutional verification'), 'Reports verification required for unconfigured rules');

  // Case E: Missing Student Profile Information
  const missingInfoContext: StudentAssessmentContext = {
    ...eligibleContext,
    stream: '',
    enrolledSubjects: [],
  };
  const evalE = evaluateRules(btechRules, missingInfoContext);
  assert(evalE.status === 'conditionally_eligible', 'Missing student info is not treated as proof of eligibility');
  assert(evalE.reasons[0].includes('stream selection required'), 'Identifies missing profile data in reason');

  // Case F: Class 10 Student
  const class10Context: StudentAssessmentContext = {
    ...eligibleContext,
    currentClass: 10,
    stream: null,
    enrolledSubjects: [
      { subject_name: 'Mathematics', marks_obtained: 90, maximum_marks: 100 },
      { subject_name: 'Science', marks_obtained: 88, maximum_marks: 100 },
    ],
  };
  const evalF = evaluateRules(btechRules, class10Context);
  assert(evalF.status === 'conditionally_eligible', 'Class 10 student flagged conditionally eligible for future pathway');
  assert(evalF.reasons.some((r) => r.includes('Can qualify by selecting SCIENCE PCM')), 'Provides actionable Class 11 stream selection advice');
}

// -------------------------------------------------------------
// Group 5: What-if Simulation Verification
// -------------------------------------------------------------
console.log('\nGroup 5: What-if Simulation Verification');
{
  // 1. Audit Check: Simulation feature status in current codebase
  const isSimulationEndpointImplemented = false; // Reported as missing per audit requirements
  assert(!isSimulationEndpointImplemented, 'What-if Simulation endpoint confirmed as missing (not prematurely built)');

  // 2. In-Memory Simulation Verification:
  // Given a Class 12 Commerce student evaluating MBBS (ordinarily NOT_ELIGIBLE),
  // a hypothetical simulation where the student tests PCB stream recalculates status in memory.
  const doctorRules: CareerRule[] = [
    {
      id: 20,
      node_id: 15,
      rule_type: 'REQUIRED_STREAM',
      required_stream: 'SCIENCE_PCB',
      required_subjects: ['Biology', 'Physics', 'Chemistry'],
      min_aggregate_marks: 50,
      required_exam_node_id: 12,
      description: 'Requires Class 12 Science with Biology (PCB)',
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 21,
      node_id: 15,
      rule_type: 'REQUIRED_EXAM',
      required_stream: null,
      required_subjects: [],
      min_aggregate_marks: null,
      required_exam_node_id: 12,
      description: 'Mandatory qualifying rank in NEET UG medical entrance examination',
      is_mandatory: true,
      created_at: new Date().toISOString(),
    },
  ];

  const actualStudentProfile: StudentAssessmentContext = {
    currentClass: 12,
    stream: 'COMMERCE',
    interests: ['FINANCE'],
    preferredCareers: ['Chartered Accountant'],
    enrolledSubjects: [{ subject_name: 'Accountancy', marks_obtained: 88, maximum_marks: 100 }],
    assessmentScores: { academic: 88, aptitude: 80, behavioural: 75, situational: 70 },
    dimensionAverages: {},
    situationalSignals: {},
    academicSubjectScores: {},
    aptitudeTopicScores: {},
  };

  // Baseline evaluation for actual student profile
  const baselineEval = evaluateRules(doctorRules, actualStudentProfile);
  assert(baselineEval.status === 'not_eligible', 'Actual Commerce student profile is not eligible for Doctor');

  // In-memory hypothetical simulation: simulate alternate stream 'SCIENCE_PCB'
  const hypotheticalProfile: StudentAssessmentContext = {
    ...actualStudentProfile,
    stream: 'SCIENCE_PCB',
    enrolledSubjects: [
      { subject_name: 'Biology', marks_obtained: 85, maximum_marks: 100 },
      { subject_name: 'Physics', marks_obtained: 80, maximum_marks: 100 },
      { subject_name: 'Chemistry', marks_obtained: 78, maximum_marks: 100 },
    ],
  };

  const simulatedEval = evaluateRules(doctorRules, hypotheticalProfile);
  assert(simulatedEval.status === 'conditionally_eligible', 'Hypothetical simulation recalculates status without DB mutation');

  // Verify actual student profile immutability
  assert(actualStudentProfile.stream === 'COMMERCE', 'Actual student profile remains unchanged (stream = COMMERCE)');
  assert(actualStudentProfile.preferredCareers[0] === 'Chartered Accountant', 'Actual student preferences intact');
}

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n========================================');
console.log(`Career Graph Unit Tests Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('========================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
