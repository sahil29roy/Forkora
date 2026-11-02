import { pool, query } from '../config/db';

interface SeedNode {
  code: string;
  title: string;
  node_type: 'EDUCATION_LEVEL' | 'STREAM' | 'EXAM' | 'COURSE' | 'CAREER';
  education_level: 'CLASS_10' | 'CLASS_12' | 'EXAM' | 'GRADUATION' | 'CAREER';
  stream: string;
  description: string;
  typical_duration_months: number;
  salary_range_inr?: { min: number; max: number; median: number };
  skills?: string[];
  relevant_subjects?: string[];
}

interface SeedEdge {
  from_code: string;
  to_code: string;
  transition_type: 'ACADEMIC' | 'EXAM' | 'DIRECT' | 'LATERAL' | 'CAREER';
  reversibility: 'REVERSIBLE' | 'PARTIALLY_REVERSIBLE' | 'LOCKED_IN';
  min_duration_months: number;
  description: string;
}

interface SeedRule {
  node_code: string;
  rule_type: 'REQUIRED_SUBJECTS' | 'MIN_MARKS' | 'REQUIRED_STREAM' | 'REQUIRED_EXAM';
  required_stream?: string;
  required_subjects?: string[];
  min_aggregate_marks?: number;
  required_exam_code?: string;
  description: string;
  is_mandatory?: boolean;
}

export const SEED_NODES: SeedNode[] = [
  // 1. Starting Education Level
  {
    code: 'CLASS_10',
    title: 'Class 10',
    node_type: 'EDUCATION_LEVEL',
    education_level: 'CLASS_10',
    stream: 'ANY',
    description: 'Secondary School Education completion. Foundation for senior secondary stream selection.',
    typical_duration_months: 12,
  },

  // 2. Class 12 Streams
  {
    code: 'STREAM_SCIENCE_PCM',
    title: 'Class 12 Science (PCM)',
    node_type: 'STREAM',
    education_level: 'CLASS_12',
    stream: 'SCIENCE_PCM',
    description: 'Senior Secondary Science with Physics, Chemistry, and Mathematics.',
    typical_duration_months: 24,
    relevant_subjects: ['Physics', 'Chemistry', 'Mathematics'],
  },
  {
    code: 'STREAM_SCIENCE_PCB',
    title: 'Class 12 Science (PCB)',
    node_type: 'STREAM',
    education_level: 'CLASS_12',
    stream: 'SCIENCE_PCB',
    description: 'Senior Secondary Science with Physics, Chemistry, and Biology. Direct path to healthcare and medical fields.',
    typical_duration_months: 24,
    relevant_subjects: ['Physics', 'Chemistry', 'Biology'],
  },
  {
    code: 'STREAM_SCIENCE_PCMB',
    title: 'Class 12 Science (PCMB)',
    node_type: 'STREAM',
    education_level: 'CLASS_12',
    stream: 'SCIENCE_PCMB',
    description: 'Senior Secondary Science with Physics, Chemistry, Mathematics, and Biology for dual eligibility.',
    typical_duration_months: 24,
    relevant_subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  },
  {
    code: 'STREAM_COMMERCE_MATH',
    title: 'Class 12 Commerce with Mathematics',
    node_type: 'STREAM',
    education_level: 'CLASS_12',
    stream: 'COMMERCE',
    description: 'Senior Secondary Commerce including Accountancy, Business Studies, Economics, and Core Mathematics.',
    typical_duration_months: 24,
    relevant_subjects: ['Accountancy', 'Economics', 'Business Studies', 'Mathematics'],
  },
  {
    code: 'STREAM_COMMERCE_NO_MATH',
    title: 'Class 12 Commerce without Mathematics',
    node_type: 'STREAM',
    education_level: 'CLASS_12',
    stream: 'COMMERCE',
    description: 'Senior Secondary Commerce without advanced mathematics, focusing on business, management, and accountancy.',
    typical_duration_months: 24,
    relevant_subjects: ['Accountancy', 'Economics', 'Business Studies'],
  },
  {
    code: 'STREAM_HUMANITIES',
    title: 'Class 12 Humanities & Social Sciences',
    node_type: 'STREAM',
    education_level: 'CLASS_12',
    stream: 'HUMANITIES',
    description: 'Senior Secondary Arts focusing on History, Political Science, Psychology, Sociology, and Economics.',
    typical_duration_months: 24,
    relevant_subjects: ['History', 'Political Science', 'Psychology', 'Sociology', 'Economics'],
  },

  // 3. Entrance Exams
  {
    code: 'EXAM_JEE_MAIN',
    title: 'JEE Main',
    node_type: 'EXAM',
    education_level: 'EXAM',
    stream: 'SCIENCE_PCM',
    description: 'Joint Entrance Examination for admission into NITs, IIITs, and qualifying step for JEE Advanced.',
    typical_duration_months: 6,
  },
  {
    code: 'EXAM_JEE_ADV',
    title: 'JEE Advanced',
    node_type: 'EXAM',
    education_level: 'EXAM',
    stream: 'SCIENCE_PCM',
    description: 'Premier national competitive examination for admissions to Indian Institutes of Technology (IITs).',
    typical_duration_months: 6,
  },
  {
    code: 'EXAM_NEET_UG',
    title: 'NEET UG',
    node_type: 'EXAM',
    education_level: 'EXAM',
    stream: 'SCIENCE_PCB',
    description: 'National Eligibility cum Entrance Test for undergraduate medical (MBBS, BDS, AYUSH) programs.',
    typical_duration_months: 6,
  },
  {
    code: 'EXAM_CUET_UG',
    title: 'CUET UG',
    node_type: 'EXAM',
    education_level: 'EXAM',
    stream: 'ANY',
    description: 'Common University Entrance Test for admission to central and state public universities.',
    typical_duration_months: 3,
  },
  {
    code: 'EXAM_CLAT',
    title: 'CLAT',
    node_type: 'EXAM',
    education_level: 'EXAM',
    stream: 'ANY',
    description: 'Common Law Admission Test for admission into 24 National Law Universities across India.',
    typical_duration_months: 6,
  },
  {
    code: 'EXAM_CA_FOUNDATION',
    title: 'CA Foundation',
    node_type: 'EXAM',
    education_level: 'EXAM',
    stream: 'ANY',
    description: 'Entry-level exam conducted by ICAI to qualify for Chartered Accountancy intermediate training.',
    typical_duration_months: 6,
  },
  {
    code: 'EXAM_IPMAT',
    title: 'IPMAT',
    node_type: 'EXAM',
    education_level: 'EXAM',
    stream: 'ANY',
    description: 'Integrated Programme in Management Aptitude Test conducted by IIM Indore, IIM Rohtak.',
    typical_duration_months: 4,
  },
  {
    code: 'EXAM_UCEED',
    title: 'UCEED / NID DAT',
    node_type: 'EXAM',
    education_level: 'EXAM',
    stream: 'ANY',
    description: 'Undergraduate Common Entrance Examination for Design at IIT Bombay, IIT Delhi, and NID.',
    typical_duration_months: 4,
  },

  // 4. Undergraduate Degree Courses
  {
    code: 'DEGREE_BTECH_CSE',
    title: 'B.Tech Computer Science & Engineering',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'SCIENCE_PCM',
    description: '4-year engineering program covering algorithms, system design, software engineering, and artificial intelligence.',
    typical_duration_months: 48,
    skills: ['Data Structures', 'Algorithms', 'System Design', 'Software Engineering'],
  },
  {
    code: 'DEGREE_BTECH_ECE',
    title: 'B.Tech Electronics & Communication',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'SCIENCE_PCM',
    description: '4-year degree covering microprocessors, digital signal processing, embedded systems, and telecommunications.',
    typical_duration_months: 48,
    skills: ['Embedded Systems', 'Signal Processing', 'Circuit Design'],
  },
  {
    code: 'DEGREE_BCA',
    title: 'BCA (Bachelor of Computer Applications)',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'ANY',
    description: '3-year applied computer science degree focusing on application development, database management, and web tools.',
    typical_duration_months: 36,
    skills: ['Application Development', 'Databases', 'Web Technologies'],
  },
  {
    code: 'DEGREE_BSC_CS',
    title: 'B.Sc Data Science & Mathematics',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'SCIENCE_PCM',
    description: '3 to 4-year degree focusing on probability, mathematical statistics, machine learning, and data analytics.',
    typical_duration_months: 36,
    skills: ['Statistical Modeling', 'Machine Learning', 'Linear Algebra', 'Python'],
  },
  {
    code: 'DEGREE_MBBS',
    title: 'MBBS (Medicine & Surgery)',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'SCIENCE_PCB',
    description: '5.5-year clinical degree (4.5 academic years + 1-year compulsory rotating medical internship).',
    typical_duration_months: 66,
    skills: ['Clinical Diagnostics', 'Pathology', 'Pharmacology', 'Patient Care'],
  },
  {
    code: 'DEGREE_BDS',
    title: 'BDS (Bachelor of Dental Surgery)',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'SCIENCE_PCB',
    description: '5-year professional program for dental surgery, oral medicine, and dental health sciences.',
    typical_duration_months: 60,
  },
  {
    code: 'DEGREE_BSC_BIOTECH',
    title: 'B.Sc Biotechnology & Life Sciences',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'SCIENCE_PCB',
    description: '3 to 4-year undergraduate degree in genetic engineering, immunology, and bioinformatics.',
    typical_duration_months: 36,
    skills: ['Gene Editing', 'Bioinformatics', 'Cell Culture', 'Molecular Biology'],
  },
  {
    code: 'DEGREE_BCOM_HONS',
    title: 'B.Com (Honours) in Accounting & Finance',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'COMMERCE',
    description: 'Rigorous undergraduate commerce program covering corporate accounting, taxation, auditing, and corporate finance.',
    typical_duration_months: 36,
    skills: ['Financial Analysis', 'Auditing', 'Taxation', 'Corporate Law'],
  },
  {
    code: 'DEGREE_BBA',
    title: 'BBA (Bachelor of Business Administration)',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'ANY',
    description: '3-year program in business principles, organizational leadership, marketing strategy, and operations.',
    typical_duration_months: 36,
    skills: ['Strategic Planning', 'Marketing', 'People Management', 'Financial Modeling'],
  },
  {
    code: 'DEGREE_BA_LLB',
    title: 'BA LLB (5-Year Integrated Law)',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'ANY',
    description: '5-year integrated double degree combining arts with comprehensive jurisprudence, constitutional law, and corporate law.',
    typical_duration_months: 60,
    skills: ['Legal Research', 'Contract Law', 'Constitutional Analysis', 'Litigation & Advocacy'],
  },
  {
    code: 'DEGREE_BA_PSYCHOLOGY',
    title: 'BA / B.Sc in Psychology',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'ANY',
    description: 'Undergraduate study in human cognition, developmental psychology, neurobiology, and psychological testing.',
    typical_duration_months: 36,
    skills: ['Behavioural Analysis', 'Psychometrics', 'Counselling Techniques', 'Research Methods'],
  },
  {
    code: 'DEGREE_BA_ECONOMICS',
    title: 'BA (Honours) in Economics',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'ANY',
    description: 'Rigorous quantitative economics, econometrics, macroeconomics, game theory, and fiscal policy analysis.',
    typical_duration_months: 36,
    skills: ['Econometrics', 'Economic Modeling', 'Data Analysis', 'Policy Evaluation'],
  },
  {
    code: 'DEGREE_BA_POL_SCI',
    title: 'BA in Political Science & Public Affairs',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'ANY',
    description: 'Deep study of governance structures, public administration, international diplomacy, and public policy.',
    typical_duration_months: 36,
    skills: ['Public Policy', 'Constitutional Law', 'Governance Analysis', 'Diplomatic Communication'],
  },
  {
    code: 'DEGREE_BDES',
    title: 'B.Des (Bachelor of Design)',
    node_type: 'COURSE',
    education_level: 'GRADUATION',
    stream: 'ANY',
    description: '4-year professional design degree in interaction design, visual communication, and product design.',
    typical_duration_months: 48,
    skills: ['User Interface Design', 'Design Thinking', 'Prototyping', 'User Research'],
  },

  // 5. Careers
  {
    code: 'CAREER_SOFTWARE_ENGINEER',
    title: 'Software Engineer',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'SCIENCE_PCM',
    description: 'Architects, codes, and maintains scalable digital systems, cloud platforms, and distributed software solutions.',
    typical_duration_months: 0,
    salary_range_inr: { min: 600000, max: 3500000, median: 1400000 },
    skills: ['Software Architecture', 'Full Stack Development', 'Problem Solving', 'Cloud Computing'],
    relevant_subjects: ['Mathematics', 'Computer Science', 'Physics'],
  },
  {
    code: 'CAREER_DATA_SCIENTIST',
    title: 'Data Scientist',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'SCIENCE_PCM',
    description: 'Applies statistical modeling, machine learning, and computational tools to uncover predictive insights and build AI agents.',
    typical_duration_months: 0,
    salary_range_inr: { min: 800000, max: 4000000, median: 1600000 },
    skills: ['Machine Learning', 'Statistical Modeling', 'Python', 'Big Data Analytics'],
    relevant_subjects: ['Mathematics', 'Statistics', 'Computer Science'],
  },
  {
    code: 'CAREER_CYBERSECURITY',
    title: 'Cybersecurity Analyst',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'SCIENCE_PCM',
    description: 'Safeguards organizational digital assets, conducts penetration testing, threat hunting, and designs defense systems.',
    typical_duration_months: 0,
    salary_range_inr: { min: 550000, max: 3000000, median: 1200000 },
    skills: ['Network Security', 'Ethical Hacking', 'Threat Modeling', 'Cryptography'],
    relevant_subjects: ['Mathematics', 'Computer Science', 'Physics'],
  },
  {
    code: 'CAREER_DOCTOR',
    title: 'Doctor',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'SCIENCE_PCB',
    description: 'Diagnoses clinical ailments, performs patient interventions, prescribes treatments, and promotes community wellness.',
    typical_duration_months: 0,
    salary_range_inr: { min: 800000, max: 5000000, median: 1800000 },
    skills: ['Clinical Diagnosis', 'Patient Care', 'Surgical Principles', 'Medical Ethics'],
    relevant_subjects: ['Biology', 'Chemistry', 'Physics'],
  },
  {
    code: 'CAREER_BIOTECHNOLOGIST',
    title: 'Biotechnologist',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'SCIENCE_PCB',
    description: 'Engineers biological solutions in pharmaceutical drug development, genetic therapies, agriculture, and bio-manufacturing.',
    typical_duration_months: 0,
    salary_range_inr: { min: 450000, max: 2200000, median: 850000 },
    skills: ['Genetic Engineering', 'Molecular Biology', 'Laboratory Research', 'Bioinformatics'],
    relevant_subjects: ['Biology', 'Chemistry'],
  },
  {
    code: 'CAREER_CHARTERED_ACCOUNTANT',
    title: 'Chartered Accountant',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'COMMERCE',
    description: 'Certified financial authority managing statutory audit, corporate taxation, forensic accounting, and fiscal advisory.',
    typical_duration_months: 0,
    salary_range_inr: { min: 700000, max: 3500000, median: 1300000 },
    skills: ['Statutory Auditing', 'Corporate Taxation', 'Forensic Accounting', 'Financial Reporting'],
    relevant_subjects: ['Accountancy', 'Economics', 'Mathematics'],
  },
  {
    code: 'CAREER_INVESTMENT_BANKER',
    title: 'Investment Banker',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'COMMERCE',
    description: 'Advises corporations and governments on capital raising, mergers and acquisitions, debt restructuring, and IPOs.',
    typical_duration_months: 0,
    salary_range_inr: { min: 1000000, max: 6000000, median: 2200000 },
    skills: ['Financial Modeling', 'Valuation Analysis', 'M&A Advisory', 'Capital Markets'],
    relevant_subjects: ['Mathematics', 'Economics', 'Accountancy'],
  },
  {
    code: 'CAREER_PRODUCT_MANAGER',
    title: 'Product Manager',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'ANY',
    description: 'Sits at the intersection of technology, business, and user experience to define product vision and roadmap execution.',
    typical_duration_months: 0,
    salary_range_inr: { min: 900000, max: 4500000, median: 1800000 },
    skills: ['Product Strategy', 'User Empathy', 'Data-Driven Decision Making', 'Agile Roadmapping'],
    relevant_subjects: ['Mathematics', 'Economics', 'Business Studies'],
  },
  {
    code: 'CAREER_CORPORATE_LAWYER',
    title: 'Corporate Lawyer',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'ANY',
    description: 'Advises corporate entities on mergers, intellectual property, regulatory compliance, antitrust laws, and high-stakes arbitration.',
    typical_duration_months: 0,
    salary_range_inr: { min: 650000, max: 4000000, median: 1500000 },
    skills: ['Legal Drafting', 'Contract Negotiation', 'Regulatory Compliance', 'Litigation Strategy'],
    relevant_subjects: ['Political Science', 'History', 'English', 'Legal Studies'],
  },
  {
    code: 'CAREER_CIVIL_SERVANT',
    title: 'Civil Servant (IAS / IPS / IFS)',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'ANY',
    description: 'Administers public governance, executes government policy, maintains public order, and represents the nation diplomatically.',
    typical_duration_months: 0,
    salary_range_inr: { min: 700000, max: 2500000, median: 1200000 },
    skills: ['Public Administration', 'Crisis Leadership', 'Policy Analysis', 'Ethical Governance'],
    relevant_subjects: ['Political Science', 'History', 'Geography', 'Economics'],
  },
  {
    code: 'CAREER_CLINICAL_PSYCHOLOGIST',
    title: 'Clinical Psychologist',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'ANY',
    description: 'Assesses mental health disorders, administers psychotherapy interventions, and designs holistic mental wellness programs.',
    typical_duration_months: 0,
    salary_range_inr: { min: 400000, max: 2000000, median: 750000 },
    skills: ['Psychological Assessment', 'Cognitive Behaviour Therapy', 'Empathy', 'Case Formulation'],
    relevant_subjects: ['Psychology', 'Biology', 'English'],
  },
  {
    code: 'CAREER_UI_UX_DESIGNER',
    title: 'UI/UX Designer',
    node_type: 'CAREER',
    education_level: 'CAREER',
    stream: 'ANY',
    description: 'Creates intuitive visual interfaces, conducts usability tests, and builds delightful customer journeys across digital products.',
    typical_duration_months: 0,
    salary_range_inr: { min: 500000, max: 2800000, median: 1100000 },
    skills: ['Interaction Design', 'Wireframing', 'Design Systems', 'Usability Testing'],
    relevant_subjects: ['Arts', 'Computer Science', 'Psychology'],
  },
];

export const SEED_EDGES: SeedEdge[] = [
  // Class 10 to Streams
  { from_code: 'CLASS_10', to_code: 'STREAM_SCIENCE_PCM', transition_type: 'ACADEMIC', reversibility: 'REVERSIBLE', min_duration_months: 24, description: 'Choose Senior Secondary Science stream with Physics, Chemistry, and Mathematics' },
  { from_code: 'CLASS_10', to_code: 'STREAM_SCIENCE_PCB', transition_type: 'ACADEMIC', reversibility: 'REVERSIBLE', min_duration_months: 24, description: 'Choose Senior Secondary Science stream with Physics, Chemistry, and Biology' },
  { from_code: 'CLASS_10', to_code: 'STREAM_SCIENCE_PCMB', transition_type: 'ACADEMIC', reversibility: 'REVERSIBLE', min_duration_months: 24, description: 'Choose Senior Secondary Science stream with PCMB for dual eligibility' },
  { from_code: 'CLASS_10', to_code: 'STREAM_COMMERCE_MATH', transition_type: 'ACADEMIC', reversibility: 'REVERSIBLE', min_duration_months: 24, description: 'Choose Senior Secondary Commerce with Core Mathematics' },
  { from_code: 'CLASS_10', to_code: 'STREAM_COMMERCE_NO_MATH', transition_type: 'ACADEMIC', reversibility: 'REVERSIBLE', min_duration_months: 24, description: 'Choose Senior Secondary Commerce without Mathematics' },
  { from_code: 'CLASS_10', to_code: 'STREAM_HUMANITIES', transition_type: 'ACADEMIC', reversibility: 'REVERSIBLE', min_duration_months: 24, description: 'Choose Senior Secondary Arts & Humanities stream' },

  // Science PCM Transitions
  { from_code: 'STREAM_SCIENCE_PCM', to_code: 'EXAM_JEE_MAIN', transition_type: 'EXAM', reversibility: 'REVERSIBLE', min_duration_months: 6, description: 'Attempt national engineering entrance exam' },
  { from_code: 'STREAM_SCIENCE_PCM', to_code: 'DEGREE_BTECH_CSE', transition_type: 'DIRECT', reversibility: 'PARTIALLY_REVERSIBLE', min_duration_months: 48, description: 'Direct merit/state quota admission to B.Tech Computer Science' },
  { from_code: 'STREAM_SCIENCE_PCM', to_code: 'DEGREE_BCA', transition_type: 'DIRECT', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'Alternative applied software pathway via BCA' },
  { from_code: 'STREAM_SCIENCE_PCM', to_code: 'DEGREE_BSC_CS', transition_type: 'DIRECT', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'Enrol in quantitative Data Science and Mathematics' },
  { from_code: 'STREAM_SCIENCE_PCM', to_code: 'EXAM_UCEED', transition_type: 'EXAM', reversibility: 'REVERSIBLE', min_duration_months: 4, description: 'Transition to creative design via UCEED' },

  // Science PCB Transitions
  { from_code: 'STREAM_SCIENCE_PCB', to_code: 'EXAM_NEET_UG', transition_type: 'EXAM', reversibility: 'PARTIALLY_REVERSIBLE', min_duration_months: 6, description: 'Attempt national medical entrance examination' },
  { from_code: 'STREAM_SCIENCE_PCB', to_code: 'DEGREE_BSC_BIOTECH', transition_type: 'DIRECT', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'Enrol in Biotechnology and Life Sciences research degree' },

  // Science PCMB Transitions
  { from_code: 'STREAM_SCIENCE_PCMB', to_code: 'EXAM_JEE_MAIN', transition_type: 'EXAM', reversibility: 'REVERSIBLE', min_duration_months: 6, description: 'Attempt JEE Main engineering entrance' },
  { from_code: 'STREAM_SCIENCE_PCMB', to_code: 'EXAM_NEET_UG', transition_type: 'EXAM', reversibility: 'REVERSIBLE', min_duration_months: 6, description: 'Attempt NEET UG medical entrance' },

  // Commerce Transitions
  { from_code: 'STREAM_COMMERCE_MATH', to_code: 'EXAM_CA_FOUNDATION', transition_type: 'EXAM', reversibility: 'REVERSIBLE', min_duration_months: 6, description: 'Register and attempt ICAI CA Foundation' },
  { from_code: 'STREAM_COMMERCE_MATH', to_code: 'EXAM_CUET_UG', transition_type: 'EXAM', reversibility: 'REVERSIBLE', min_duration_months: 3, description: 'Attempt CUET for central university commerce programs' },
  { from_code: 'STREAM_COMMERCE_MATH', to_code: 'DEGREE_BCOM_HONS', transition_type: 'DIRECT', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'Enrol in B.Com Honours' },
  { from_code: 'STREAM_COMMERCE_MATH', to_code: 'EXAM_IPMAT', transition_type: 'EXAM', reversibility: 'REVERSIBLE', min_duration_months: 4, description: 'Attempt IIM 5-Year Integrated Management entrance' },
  { from_code: 'STREAM_COMMERCE_NO_MATH', to_code: 'DEGREE_BBA', transition_type: 'DIRECT', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'Enrol in BBA business management' },
  { from_code: 'STREAM_COMMERCE_NO_MATH', to_code: 'EXAM_CLAT', transition_type: 'EXAM', reversibility: 'REVERSIBLE', min_duration_months: 6, description: 'Prepare for law admissions test' },

  // Humanities Transitions
  { from_code: 'STREAM_HUMANITIES', to_code: 'EXAM_CLAT', transition_type: 'EXAM', reversibility: 'REVERSIBLE', min_duration_months: 6, description: 'Attempt law entrance exam for National Law Universities' },
  { from_code: 'STREAM_HUMANITIES', to_code: 'EXAM_CUET_UG', transition_type: 'EXAM', reversibility: 'REVERSIBLE', min_duration_months: 3, description: 'Attempt CUET for Arts and Humanities universities' },
  { from_code: 'STREAM_HUMANITIES', to_code: 'DEGREE_BA_PSYCHOLOGY', transition_type: 'DIRECT', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'Enrol in Psychology' },
  { from_code: 'STREAM_HUMANITIES', to_code: 'DEGREE_BA_POL_SCI', transition_type: 'DIRECT', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'Enrol in Political Science and Public Administration' },
  { from_code: 'STREAM_HUMANITIES', to_code: 'DEGREE_BA_ECONOMICS', transition_type: 'DIRECT', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'Enrol in Economics' },

  // Exams to Degree Courses
  { from_code: 'EXAM_JEE_MAIN', to_code: 'EXAM_JEE_ADV', transition_type: 'EXAM', reversibility: 'REVERSIBLE', min_duration_months: 2, description: 'Top percentile candidates qualify for JEE Advanced' },
  { from_code: 'EXAM_JEE_MAIN', to_code: 'DEGREE_BTECH_CSE', transition_type: 'ACADEMIC', reversibility: 'PARTIALLY_REVERSIBLE', min_duration_months: 48, description: 'Admission into NITs/IIITs Computer Science' },
  { from_code: 'EXAM_JEE_MAIN', to_code: 'DEGREE_BTECH_ECE', transition_type: 'ACADEMIC', reversibility: 'PARTIALLY_REVERSIBLE', min_duration_months: 48, description: 'Admission into NITs/IIITs Electronics Engineering' },
  { from_code: 'EXAM_JEE_ADV', to_code: 'DEGREE_BTECH_CSE', transition_type: 'ACADEMIC', reversibility: 'PARTIALLY_REVERSIBLE', min_duration_months: 48, description: 'Admission into IITs Computer Science' },
  { from_code: 'EXAM_NEET_UG', to_code: 'DEGREE_MBBS', transition_type: 'ACADEMIC', reversibility: 'LOCKED_IN', min_duration_months: 66, description: 'Medical college admission for MBBS' },
  { from_code: 'EXAM_NEET_UG', to_code: 'DEGREE_BDS', transition_type: 'ACADEMIC', reversibility: 'LOCKED_IN', min_duration_months: 60, description: 'Dental college admission for BDS' },
  { from_code: 'EXAM_CLAT', to_code: 'DEGREE_BA_LLB', transition_type: 'ACADEMIC', reversibility: 'PARTIALLY_REVERSIBLE', min_duration_months: 60, description: 'National Law University admission for 5-Year Integrated Law' },
  { from_code: 'EXAM_IPMAT', to_code: 'DEGREE_BBA', transition_type: 'ACADEMIC', reversibility: 'PARTIALLY_REVERSIBLE', min_duration_months: 36, description: 'IIM Integrated Management foundation program' },
  { from_code: 'EXAM_CUET_UG', to_code: 'DEGREE_BCOM_HONS', transition_type: 'ACADEMIC', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'Central University admission to B.Com (Honours)' },
  { from_code: 'EXAM_CUET_UG', to_code: 'DEGREE_BSC_CS', transition_type: 'ACADEMIC', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'Central University admission to B.Sc Data Science' },
  { from_code: 'EXAM_CUET_UG', to_code: 'DEGREE_BA_PSYCHOLOGY', transition_type: 'ACADEMIC', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'University admission to BA Psychology' },
  { from_code: 'EXAM_CUET_UG', to_code: 'DEGREE_BA_POL_SCI', transition_type: 'ACADEMIC', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'University admission to BA Political Science' },
  { from_code: 'EXAM_CUET_UG', to_code: 'DEGREE_BA_ECONOMICS', transition_type: 'ACADEMIC', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'University admission to BA Economics' },
  { from_code: 'EXAM_UCEED', to_code: 'DEGREE_BDES', transition_type: 'ACADEMIC', reversibility: 'PARTIALLY_REVERSIBLE', min_duration_months: 48, description: 'Admission to IIT / NID Bachelor of Design' },

  // Degrees to Careers
  { from_code: 'DEGREE_BTECH_CSE', to_code: 'CAREER_SOFTWARE_ENGINEER', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Campus placements and industry hiring as Software Engineer' },
  { from_code: 'DEGREE_BTECH_CSE', to_code: 'CAREER_DATA_SCIENTIST', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Transition into Machine Learning and Data Science roles' },
  { from_code: 'DEGREE_BTECH_CSE', to_code: 'CAREER_CYBERSECURITY', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Specialize in Information Security and Vulnerability Analysis' },
  { from_code: 'DEGREE_BTECH_CSE', to_code: 'CAREER_PRODUCT_MANAGER', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Technical Product Management roles in tech companies' },
  { from_code: 'DEGREE_BCA', to_code: 'CAREER_SOFTWARE_ENGINEER', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Industry hiring as Software Developer and Web Engineer' },
  { from_code: 'DEGREE_BSC_CS', to_code: 'CAREER_DATA_SCIENTIST', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Analytics and Data Modeling roles in finance and tech' },
  { from_code: 'DEGREE_BSC_CS', to_code: 'CAREER_SOFTWARE_ENGINEER', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Software Engineering through coding and algorithmic proficiency' },
  { from_code: 'DEGREE_MBBS', to_code: 'CAREER_DOCTOR', transition_type: 'CAREER', reversibility: 'LOCKED_IN', min_duration_months: 0, description: 'Medical registration and clinical practice as Physician / Resident Doctor' },
  { from_code: 'DEGREE_BSC_BIOTECH', to_code: 'CAREER_BIOTECHNOLOGIST', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'R&D labs, pharmaceutical development, and clinical research' },
  { from_code: 'EXAM_CA_FOUNDATION', to_code: 'CAREER_CHARTERED_ACCOUNTANT', transition_type: 'CAREER', reversibility: 'LOCKED_IN', min_duration_months: 36, description: 'Progress through CA Intermediate, Articleship, and CA Final certification' },
  { from_code: 'DEGREE_BCOM_HONS', to_code: 'CAREER_INVESTMENT_BANKER', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Analyst roles in investment banks, equity research, and wealth advisory' },
  { from_code: 'DEGREE_BCOM_HONS', to_code: 'CAREER_CHARTERED_ACCOUNTANT', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 36, description: 'Direct entry into CA Intermediate for Commerce graduates' },
  { from_code: 'DEGREE_BBA', to_code: 'CAREER_PRODUCT_MANAGER', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Associate Product Manager and business operations roles' },
  { from_code: 'DEGREE_BBA', to_code: 'CAREER_INVESTMENT_BANKER', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Corporate finance and asset management analyst positions' },
  { from_code: 'DEGREE_BA_LLB', to_code: 'CAREER_CORPORATE_LAWYER', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Bar council enrollment and associate attorney in corporate law firms' },
  { from_code: 'DEGREE_BA_LLB', to_code: 'CAREER_CIVIL_SERVANT', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 12, description: 'UPSC Civil Services preparation with Law as optional subject' },
  { from_code: 'DEGREE_BA_POL_SCI', to_code: 'CAREER_CIVIL_SERVANT', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 12, description: 'UPSC Civil Services with Political Science and International Relations' },
  { from_code: 'DEGREE_BA_ECONOMICS', to_code: 'CAREER_INVESTMENT_BANKER', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Macroeconomic analysis and investment banking analyst programs' },
  { from_code: 'DEGREE_BA_ECONOMICS', to_code: 'CAREER_DATA_SCIENTIST', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Quantitative econometrics and predictive market intelligence' },
  { from_code: 'DEGREE_BA_PSYCHOLOGY', to_code: 'CAREER_CLINICAL_PSYCHOLOGIST', transition_type: 'CAREER', reversibility: 'PARTIALLY_REVERSIBLE', min_duration_months: 24, description: 'Clinical psychologist with M.Phil / Master in Clinical Psychology' },
  { from_code: 'DEGREE_BDES', to_code: 'CAREER_UI_UX_DESIGNER', transition_type: 'CAREER', reversibility: 'REVERSIBLE', min_duration_months: 0, description: 'Product design, UX research, and interaction design in tech companies' },
];

export const SEED_RULES: SeedRule[] = [
  // B.Tech CSE Rules
  {
    node_code: 'DEGREE_BTECH_CSE',
    rule_type: 'REQUIRED_STREAM',
    required_stream: 'SCIENCE_PCM',
    description: 'Requires Class 12 Science with Physics, Chemistry, and Mathematics (PCM).',
    is_mandatory: true,
  },
  {
    node_code: 'DEGREE_BTECH_CSE',
    rule_type: 'REQUIRED_SUBJECTS',
    required_subjects: ['Mathematics', 'Physics', 'Chemistry'],
    min_aggregate_marks: 60,
    description: 'Minimum 60% aggregate in Physics, Chemistry, and Mathematics in Class 12.',
    is_mandatory: true,
  },

  // MBBS Rules
  {
    node_code: 'DEGREE_MBBS',
    rule_type: 'REQUIRED_STREAM',
    required_stream: 'SCIENCE_PCB',
    description: 'Requires Class 12 Science with Physics, Chemistry, and Biology (PCB).',
    is_mandatory: true,
  },
  {
    node_code: 'DEGREE_MBBS',
    rule_type: 'REQUIRED_SUBJECTS',
    required_subjects: ['Biology', 'Physics', 'Chemistry'],
    min_aggregate_marks: 50,
    description: 'Minimum 50% aggregate in PCB in Class 12 Board examination.',
    is_mandatory: true,
  },
  {
    node_code: 'DEGREE_MBBS',
    rule_type: 'REQUIRED_EXAM',
    required_exam_code: 'EXAM_NEET_UG',
    description: 'Mandatory qualifying score in NEET UG examination.',
    is_mandatory: true,
  },

  // B.Sc Data Science Rules
  {
    node_code: 'DEGREE_BSC_CS',
    rule_type: 'REQUIRED_SUBJECTS',
    required_subjects: ['Mathematics'],
    min_aggregate_marks: 50,
    description: 'Mathematics is compulsory at 10+2 level with minimum 50% marks.',
    is_mandatory: true,
  },

  // B.Com Honours Rules
  {
    node_code: 'DEGREE_BCOM_HONS',
    rule_type: 'REQUIRED_SUBJECTS',
    required_subjects: ['Mathematics'],
    min_aggregate_marks: 50,
    description: 'Requires Mathematics / Applied Mathematics in Class 12 for premier universities.',
    is_mandatory: false,
  },

  // BA LLB Rules
  {
    node_code: 'DEGREE_BA_LLB',
    rule_type: 'MIN_MARKS',
    min_aggregate_marks: 45,
    description: 'Minimum 45% aggregate in 10+2 from any recognized board.',
    is_mandatory: true,
  },
  {
    node_code: 'DEGREE_BA_LLB',
    rule_type: 'REQUIRED_EXAM',
    required_exam_code: 'EXAM_CLAT',
    description: 'Qualifying rank in CLAT / AILET or university law test.',
    is_mandatory: true,
  },

  // Software Engineer Career Rules
  {
    node_code: 'CAREER_SOFTWARE_ENGINEER',
    rule_type: 'REQUIRED_SUBJECTS',
    required_subjects: ['Mathematics'],
    description: 'Foundational analytical and mathematical competence is required.',
    is_mandatory: false,
  },

  // Doctor Career Rules
  {
    node_code: 'CAREER_DOCTOR',
    rule_type: 'REQUIRED_SUBJECTS',
    required_subjects: ['Biology', 'Chemistry'],
    description: 'Strong foundation in biological and physiological sciences is essential.',
    is_mandatory: true,
  },
];

export async function seedCareerGraph(force = false): Promise<{ nodesCount: number; edgesCount: number; rulesCount: number }> {
  const existingRes = await query<{ count: string }>('SELECT COUNT(*) AS count FROM career_nodes');
  const existingCount = parseInt(existingRes.rows[0].count, 10);

  if (existingCount > 0 && !force) {
    console.log(`[Seed] Career Graph already populated (${existingCount} nodes found). Skipping.`);
    return { nodesCount: existingCount, edgesCount: 0, rulesCount: 0 };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (force) {
      console.log('[Seed] Force mode active. Truncating career graph...');
      await client.query('TRUNCATE career_rules, career_edges, career_nodes CASCADE;');
    }

    console.log(`[Seed] Seeding ${SEED_NODES.length} career graph nodes...`);

    // 1. Insert Nodes
    const nodeCodeToIdMap = new Map<string, number>();

    for (const node of SEED_NODES) {
      const res = await client.query(
        `INSERT INTO career_nodes (
          code, title, node_type, education_level, stream, description,
          typical_duration_months, salary_range_inr, skills, relevant_subjects, is_published
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
        ON CONFLICT (code) DO UPDATE SET
          title = EXCLUDED.title,
          node_type = EXCLUDED.node_type,
          education_level = EXCLUDED.education_level,
          stream = EXCLUDED.stream,
          description = EXCLUDED.description,
          typical_duration_months = EXCLUDED.typical_duration_months,
          salary_range_inr = EXCLUDED.salary_range_inr,
          skills = EXCLUDED.skills,
          relevant_subjects = EXCLUDED.relevant_subjects
        RETURNING id, code;`,
        [
          node.code,
          node.title,
          node.node_type,
          node.education_level,
          node.stream,
          node.description,
          node.typical_duration_months,
          JSON.stringify(node.salary_range_inr || { min: 0, max: 0, median: 0 }),
          node.skills || [],
          node.relevant_subjects || [],
        ]
      );
      nodeCodeToIdMap.set(res.rows[0].code, res.rows[0].id);
    }

    console.log(`[Seed] Seeding ${SEED_EDGES.length} career graph edges...`);

    // 2. Insert Edges
    let edgesInserted = 0;
    for (const edge of SEED_EDGES) {
      const fromId = nodeCodeToIdMap.get(edge.from_code);
      const toId = nodeCodeToIdMap.get(edge.to_code);

      if (!fromId || !toId) {
        console.warn(`[Seed] Warning: missing node for edge ${edge.from_code} -> ${edge.to_code}`);
        continue;
      }

      await client.query(
        `INSERT INTO career_edges (from_node_id, to_node_id, transition_type, reversibility, min_duration_months, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (from_node_id, to_node_id) DO UPDATE SET
           transition_type = EXCLUDED.transition_type,
           reversibility = EXCLUDED.reversibility,
           min_duration_months = EXCLUDED.min_duration_months,
           description = EXCLUDED.description;`,
        [fromId, toId, edge.transition_type, edge.reversibility, edge.min_duration_months, edge.description]
      );
      edgesInserted++;
    }

    console.log(`[Seed] Seeding ${SEED_RULES.length} career rules & prerequisites...`);

    // 3. Insert Rules
    let rulesInserted = 0;
    for (const rule of SEED_RULES) {
      const nodeId = nodeCodeToIdMap.get(rule.node_code);
      if (!nodeId) continue;

      const examNodeId = rule.required_exam_code ? nodeCodeToIdMap.get(rule.required_exam_code) || null : null;

      await client.query(
        `INSERT INTO career_rules (
          node_id, rule_type, required_stream, required_subjects,
          min_aggregate_marks, required_exam_node_id, description, is_mandatory
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [
          nodeId,
          rule.rule_type,
          rule.required_stream || null,
          rule.required_subjects || [],
          rule.min_aggregate_marks || null,
          examNodeId,
          rule.description,
          rule.is_mandatory ?? true,
        ]
      );
      rulesInserted++;
    }

    await client.query('COMMIT');

    console.log(`[Seed] ✅ Career Graph successfully seeded:`);
    console.log(`       - Nodes: ${nodeCodeToIdMap.size}`);
    console.log(`       - Edges: ${edgesInserted}`);
    console.log(`       - Rules: ${rulesInserted}`);

    return {
      nodesCount: nodeCodeToIdMap.size,
      edgesCount: edgesInserted,
      rulesCount: rulesInserted,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Seed Error] Failed to seed Career Graph:', error);
    throw error;
  } finally {
    client.release();
  }
}
