import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { careerService } from '@/services/career.service';
import type { CareerPathway, CareerRecommendationItem } from '@/types/career.types';
import {
  GitBranch,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Bookmark,
  BookmarkCheck,
  Compass,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  Layers,
  ChevronRight,
  Info,
  TrendingUp,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  Filter,
  Share2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

export interface CareerGraphItem {
  career: string;
  career_code: string;
  node_id: number;
  compatibilityScore: number;
  eligibility: 'eligible' | 'conditionally_eligible' | 'not_eligible' | 'unknown';
  domain: string;
  salary_range_inr: { min: number; max: number; median: number };
  skills: string[];
  description: string;
  pathways: CareerPathway[];
}

export interface NodeDetailInfo {
  title: string;
  type: 'STAGE' | 'STREAM' | 'EXAM' | 'COURSE' | 'CAREER';
  categoryLabel: string;
  durationText: string;
  description: string;
  subjects?: string[];
  eligibilityNote?: string;
  keyMilestones?: string[];
}

// 12 Core Forkora Verified Careers Catalog
export const CAREER_CATALOG: CareerGraphItem[] = [
  {
    career: 'Software Engineer',
    career_code: 'CAREER_SOFTWARE_ENGINEER',
    node_id: 28,
    compatibilityScore: 86,
    eligibility: 'eligible',
    domain: 'Technology · Computer Science',
    salary_range_inr: { min: 600000, max: 3500000, median: 1400000 },
    skills: ['Data Structures & Algorithms', 'System Architecture', 'Full Stack Development', 'Cloud Computing'],
    description: 'Designs, develops, tests, and deploys high-scale software applications, distributed microservices, and modern web platforms.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (B.Tech CSE)',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'JEE Main', 'B.Tech Computer Science & Engineering', 'Software Engineer'],
        total_duration_months: 48,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1 (Data Science & Mathematics)',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'CUET UG', 'B.Sc Data Science & Mathematics', 'Software Engineer'],
        total_duration_months: 36,
      },
      {
        pathway_id: 'pathway_3',
        title: 'Alternative Pathway 2 (Applied Applications)',
        nodes: ['Class 10', 'Class 12 Any Stream', 'BCA (Bachelor of Computer Applications)', 'Software Engineer'],
        total_duration_months: 36,
      },
    ],
  },
  {
    career: 'Data Scientist',
    career_code: 'CAREER_DATA_SCIENTIST',
    node_id: 29,
    compatibilityScore: 82,
    eligibility: 'eligible',
    domain: 'Data Science · Artificial Intelligence',
    salary_range_inr: { min: 800000, max: 4000000, median: 1600000 },
    skills: ['Machine Learning', 'Statistical Modeling', 'Python & PyTorch', 'Data Warehousing & SQL'],
    description: 'Applies mathematical models, statistical rigor, and machine learning architectures to generate predictive intelligence from vast data repositories.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (B.Sc Data Science / Statistics)',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'CUET UG', 'B.Sc Data Science & Mathematics', 'Data Scientist'],
        total_duration_months: 36,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1 (Engineering Core)',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'JEE Main', 'B.Tech Computer Science & Engineering', 'Data Scientist'],
        total_duration_months: 48,
      },
    ],
  },
  {
    career: 'Cybersecurity Analyst',
    career_code: 'CAREER_CYBERSECURITY',
    node_id: 30,
    compatibilityScore: 76,
    eligibility: 'eligible',
    domain: 'Information Security · Infrastructure',
    salary_range_inr: { min: 550000, max: 3000000, median: 1200000 },
    skills: ['Threat Modeling', 'Network Defense', 'Penetration Testing', 'Cryptography & Zero Trust'],
    description: 'Guards mission-critical infrastructure, conducts vulnerability assessments, investigates cyber threats, and implements security controls.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (Engineering Security)',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'JEE Main', 'B.Tech Computer Science & Engineering', 'Cybersecurity Analyst'],
        total_duration_months: 48,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1 (Applied IT & Certifications)',
        nodes: ['Class 10', 'Class 12 Any Stream', 'BCA (Bachelor of Computer Applications)', 'Cybersecurity Analyst'],
        total_duration_months: 36,
      },
    ],
  },
  {
    career: 'Medical Doctor (MBBS)',
    career_code: 'CAREER_DOCTOR',
    node_id: 31,
    compatibilityScore: 80,
    eligibility: 'eligible',
    domain: 'Healthcare · Clinical Medicine',
    salary_range_inr: { min: 800000, max: 5000000, median: 1800000 },
    skills: ['Clinical Diagnosis', 'Patient Therapeutics', 'Pharmacology', 'Pathology & Surgery Protocols'],
    description: 'Diagnoses illnesses, prescribes clinical interventions, performs medical procedures, and provides patient-centered care.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (MBBS Clinical)',
        nodes: ['Class 10', 'Class 12 Science (PCB)', 'NEET UG', 'MBBS (Medicine & Surgery)', 'Medical Doctor (MBBS)'],
        total_duration_months: 66,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1 (Dental Healthcare)',
        nodes: ['Class 10', 'Class 12 Science (PCB)', 'NEET UG', 'BDS (Bachelor of Dental Surgery)', 'Medical Doctor (MBBS)'],
        total_duration_months: 60,
      },
    ],
  },
  {
    career: 'Biotechnologist',
    career_code: 'CAREER_BIOTECHNOLOGIST',
    node_id: 32,
    compatibilityScore: 74,
    eligibility: 'eligible',
    domain: 'Life Sciences · Biotechnology',
    salary_range_inr: { min: 450000, max: 2200000, median: 900000 },
    skills: ['Molecular Biology', 'Genetic Engineering', 'Bioinformatics', 'Bioprocess Engineering'],
    description: 'Conducts laboratory research, manipulates genetic systems, and synthesizes pharmaceutical and agricultural biotechnological products.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (Biotech & Research)',
        nodes: ['Class 10', 'Class 12 Science (PCB)', 'CUET UG', 'B.Sc / B.Tech Biotechnology', 'Biotechnologist'],
        total_duration_months: 48,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1 (Computational Biology)',
        nodes: ['Class 10', 'Class 12 Science (PCMB)', 'JEE Main', 'B.Tech Bioinformatics', 'Biotechnologist'],
        total_duration_months: 48,
      },
    ],
  },
  {
    career: 'Chartered Accountant (CA)',
    career_code: 'CAREER_CHARTERED_ACCOUNTANT',
    node_id: 33,
    compatibilityScore: 84,
    eligibility: 'eligible',
    domain: 'Accounting · Auditing & Taxation',
    salary_range_inr: { min: 700000, max: 3200000, median: 1300000 },
    skills: ['Financial Auditing', 'Statutory Compliance', 'Direct & Indirect Taxation', 'Corporate Advisory'],
    description: 'Audits balance sheets, manages corporate tax strategies, ensures regulatory governance, and advises executive boards on financial health.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (Foundation to Articleship)',
        nodes: ['Class 10', 'Class 12 Commerce with Mathematics', 'CA Foundation', 'B.Com (Hons) & Articleship', 'Chartered Accountant (CA)'],
        total_duration_months: 48,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1 (Graduation Direct Entry)',
        nodes: ['Class 10', 'Class 12 Any Stream', 'B.Com (Hons) & Articleship', 'Chartered Accountant (CA)'],
        total_duration_months: 36,
      },
    ],
  },
  {
    career: 'Investment Banker',
    career_code: 'CAREER_INVESTMENT_BANKER',
    node_id: 34,
    compatibilityScore: 78,
    eligibility: 'eligible',
    domain: 'Finance · Capital Markets',
    salary_range_inr: { min: 1200000, max: 6500000, median: 2400000 },
    skills: ['DCF & Financial Modeling', 'Mergers & Acquisitions', 'Equity Capital Markets', 'Valuation Analysis'],
    description: 'Advises corporations and governments on capital raising, cross-border M&A transactions, IPO underwriting, and leveraged buyouts.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (Commerce & Finance)',
        nodes: ['Class 10', 'Class 12 Commerce with Mathematics', 'CUET UG', 'B.Com (Hons) / BBA Finance', 'Investment Banker'],
        total_duration_months: 36,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1 (Quantitative Engineering)',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'JEE Main', 'B.Tech Computer Science & Engineering', 'Investment Banker'],
        total_duration_months: 48,
      },
    ],
  },
  {
    career: 'Product Manager',
    career_code: 'CAREER_PRODUCT_MANAGER',
    node_id: 35,
    compatibilityScore: 72,
    eligibility: 'conditionally_eligible',
    domain: 'Business · Product & Technology',
    salary_range_inr: { min: 900000, max: 4500000, median: 1800000 },
    skills: ['Product Strategy', 'User Research & Discovery', 'Agile Roadmapping', 'Data-Driven Analytics'],
    description: 'Unites engineering, design, and business teams to launch user-centric software products and drive platform growth.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (Management & Strategy)',
        nodes: ['Class 10', 'Class 12 Any Stream', 'IPMAT / CUET', 'BBA Business Administration', 'Product Manager'],
        total_duration_months: 36,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1 (Technical Product Route)',
        nodes: ['Class 10', 'Class 12 Science (PCM)', 'JEE Main', 'B.Tech Computer Science & Engineering', 'Product Manager'],
        total_duration_months: 48,
      },
    ],
  },
  {
    career: 'Corporate Lawyer',
    career_code: 'CAREER_CORPORATE_LAWYER',
    node_id: 36,
    compatibilityScore: 75,
    eligibility: 'eligible',
    domain: 'Law · Corporate Governance',
    salary_range_inr: { min: 700000, max: 4000000, median: 1500000 },
    skills: ['Commercial Contracting', 'Regulatory Compliance', 'M&A Due Diligence', 'Dispute Resolution'],
    description: 'Drafts commercial agreements, ensures corporate compliance, counsels enterprises during acquisitions, and represents clients in arbitration.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (Integrated National Law)',
        nodes: ['Class 10', 'Class 12 Any Stream', 'CLAT', 'BA LLB (5-Year Integrated Law)', 'Corporate Lawyer'],
        total_duration_months: 60,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1 (Graduation + 3-Year LLB)',
        nodes: ['Class 10', 'Class 12 Any Stream', 'CUET UG', 'BBA Business Administration', 'Corporate Lawyer'],
        total_duration_months: 72,
      },
    ],
  },
  {
    career: 'Civil Servant (IAS/IPS)',
    career_code: 'CAREER_CIVIL_SERVANT',
    node_id: 37,
    compatibilityScore: 77,
    eligibility: 'eligible',
    domain: 'Public Administration & Policy',
    salary_range_inr: { min: 800000, max: 2800000, median: 1400000 },
    skills: ['Public Policy Formulation', 'Crisis Administration', 'Constitutional Law', 'Development Governance'],
    description: 'Administers government departments, executes public policies, enforces law and order, and spearheads district-level development.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (Humanities & Governance)',
        nodes: ['Class 10', 'Class 12 Humanities & Social Sciences', 'CUET UG', 'BA Political Science / History', 'Civil Servant (IAS/IPS)'],
        total_duration_months: 36,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1 (Any Graduate Discipline)',
        nodes: ['Class 10', 'Class 12 Any Stream', 'B.Tech / B.Sc / B.Com Degree', 'Civil Servant (IAS/IPS)'],
        total_duration_months: 48,
      },
    ],
  },
  {
    career: 'Clinical Psychologist',
    career_code: 'CAREER_CLINICAL_PSYCHOLOGIST',
    node_id: 38,
    compatibilityScore: 71,
    eligibility: 'eligible',
    domain: 'Mental Health · Behavioral Sciences',
    salary_range_inr: { min: 400000, max: 2000000, median: 800000 },
    skills: ['Psychological Assessment', 'Cognitive Behavioral Therapy', 'Diagnostic Interviewing', 'Counseling Interventions'],
    description: 'Evaluates mental health disorders, administers psychometric assessments, and provides psychotherapy to individuals and families.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (Psychology Degree to Clinical Specialization)',
        nodes: ['Class 10', 'Class 12 Humanities & Social Sciences', 'CUET UG', 'BA / B.Sc Psychology', 'Clinical Psychologist'],
        total_duration_months: 60,
      },
    ],
  },
  {
    career: 'UI/UX Designer',
    career_code: 'CAREER_UI_UX_DESIGNER',
    node_id: 39,
    compatibilityScore: 69,
    eligibility: 'eligible',
    domain: 'Design · Visual Communication',
    salary_range_inr: { min: 500000, max: 2800000, median: 1100000 },
    skills: ['User Interaction Design', 'Design Systems & Figma', 'Prototyping & Wireframing', 'Usability Testing'],
    description: 'Crafts accessible, human-centered digital experiences, develops interactive design systems, and transforms user journeys.',
    pathways: [
      {
        pathway_id: 'pathway_1',
        title: 'Primary Pathway (Professional Design Degree)',
        nodes: ['Class 10', 'Class 12 Any Stream', 'UCEED / NID DAT', 'B.Des (Bachelor of Design)', 'UI/UX Designer'],
        total_duration_months: 48,
      },
      {
        pathway_id: 'pathway_2',
        title: 'Alternative Pathway 1 (Computer Applications & UI Internship)',
        nodes: ['Class 10', 'Class 12 Any Stream', 'BCA (Bachelor of Computer Applications)', 'UI/UX Designer'],
        total_duration_months: 36,
      },
    ],
  },
];

// Rich node metadata dictionary for interactive details inspection
export const NODE_DETAILS_MAP: Record<string, NodeDetailInfo> = {
  'Class 10': {
    title: 'Secondary School Certificate (Class 10)',
    type: 'STAGE',
    categoryLabel: 'Foundational Stage',
    durationText: '12 Months',
    description: 'Universal educational baseline covering foundational Science, Mathematics, Social Studies, and Languages across CBSE/ICSE/State boards.',
    subjects: ['Mathematics', 'Science', 'Social Science', 'English', 'Regional Language'],
    eligibilityNote: 'Completion of Class 9 examination with required passing credits.',
    keyMilestones: ['Board Examination', 'Aptitude & Stream Assessment', 'Stream Selection'],
  },
  'Class 12 Science (PCM)': {
    title: 'Senior Secondary Science (Physics, Chemistry, Math)',
    type: 'STREAM',
    categoryLabel: 'Senior Secondary Stream',
    durationText: '24 Months',
    description: 'Rigorous senior secondary foundation in analytical physics, chemical principles, and advanced calculus/algebra.',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science / IP'],
    eligibilityNote: 'Class 10 pass with strong quantitative aptitude in Mathematics and Science.',
    keyMilestones: ['Class 11 Fundamentals', 'Class 12 Board Exams', 'Competitive Exam Preparation'],
  },
  'Class 12 Science (PCB)': {
    title: 'Senior Secondary Science (Physics, Chemistry, Biology)',
    type: 'STREAM',
    categoryLabel: 'Senior Secondary Stream',
    durationText: '24 Months',
    description: 'Biological sciences stream focusing on human anatomy, botany, zoology, organic chemistry, and physical sciences.',
    subjects: ['Physics', 'Chemistry', 'Biology', 'English', 'Psychology / Physical Education'],
    eligibilityNote: 'Class 10 pass with passion for life sciences and clinical medicine.',
    keyMilestones: ['Practical Laboratory Exams', 'Class 12 Board Exams', 'NEET UG Prep'],
  },
  'Class 12 Science (PCMB)': {
    title: 'Senior Secondary Science (Physics, Chemistry, Math, Biology)',
    type: 'STREAM',
    categoryLabel: 'Senior Secondary Stream',
    durationText: '24 Months',
    description: 'Dual-track rigorous stream keeping both engineering and medical entrance pathways open.',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
    eligibilityNote: 'Class 10 pass with exceptional multi-disciplinary academic discipline.',
    keyMilestones: ['Dual Exam Preparation', 'Laboratory Practicals', 'Board Examinations'],
  },
  'Class 12 Commerce with Mathematics': {
    title: 'Senior Secondary Commerce with Mathematics',
    type: 'STREAM',
    categoryLabel: 'Senior Secondary Stream',
    durationText: '24 Months',
    description: 'Focuses on financial accounting, micro & macroeconomic principles, business administration, and applied calculus.',
    subjects: ['Accountancy', 'Economics', 'Business Studies', 'Mathematics', 'English'],
    eligibilityNote: 'Class 10 pass with aptitude in numbers and commercial analysis.',
    keyMilestones: ['Accountancy Practicals', 'Economics Projects', 'CA Foundation Registration'],
  },
  'Class 12 Humanities & Social Sciences': {
    title: 'Senior Secondary Humanities & Social Sciences',
    type: 'STREAM',
    categoryLabel: 'Senior Secondary Stream',
    durationText: '24 Months',
    description: 'Liberal arts track exploring modern history, political structures, sociology, psychology, and public policy.',
    subjects: ['History', 'Political Science', 'Psychology', 'Sociology', 'Economics / English'],
    eligibilityNote: 'Class 10 pass with strong verbal reasoning and critical thinking.',
    keyMilestones: ['Research Essays', 'Class 12 Board Exams', 'CUET UG / CLAT Prep'],
  },
  'Class 12 Any Stream': {
    title: 'Senior Secondary Education (Any Stream)',
    type: 'STREAM',
    categoryLabel: 'Senior Secondary Stream',
    durationText: '24 Months',
    description: 'Open prerequisite accepting qualifying candidates from Science, Commerce, or Humanities backgrounds.',
    subjects: ['Applicable Stream Core Subjects', 'English'],
    eligibilityNote: 'Class 10 pass with recognized state or national education board.',
    keyMilestones: ['Senior Secondary Graduation', 'Entrance Registration'],
  },
  'JEE Main': {
    title: 'Joint Entrance Examination (JEE Main)',
    type: 'EXAM',
    categoryLabel: 'National Gateway Exam',
    durationText: '6 Months Prep',
    description: 'All-India computer-based examination for admission to undergraduate engineering programs at NITs, IIITs, and CFTIs.',
    subjects: ['Physics (30 Qs)', 'Chemistry (30 Qs)', 'Mathematics (30 Qs)'],
    eligibilityNote: 'Class 12 Science (PCM) with minimum 75% aggregate or top 20 percentile in board.',
    keyMilestones: ['January Session', 'April Session', 'JoSAA Centralized Counseling'],
  },
  'NEET UG': {
    title: 'National Eligibility cum Entrance Test (NEET UG)',
    type: 'EXAM',
    categoryLabel: 'National Medical Exam',
    durationText: '6 Months Prep',
    description: 'Single national entrance gateway for admission to undergraduate medical programs (MBBS, BDS, AYUSH) across India.',
    subjects: ['Physics', 'Chemistry', 'Biology (Botany & Zoology)'],
    eligibilityNote: 'Class 12 with Physics, Chemistry, and Biology (min 50% for General category).',
    keyMilestones: ['National OMR Examination', 'All India Quota Counseling', 'State Medical Allotment'],
  },
  'CUET UG': {
    title: 'Common University Entrance Test (CUET UG)',
    type: 'EXAM',
    categoryLabel: 'National University Exam',
    durationText: '3-6 Months Prep',
    description: 'Standardized national examination for admission into premier central universities like DU, BHU, JNU, and state institutions.',
    subjects: ['Domain Subjects (e.g. Math, Economics, History)', 'General Test', 'Language Test'],
    eligibilityNote: 'Class 12 pass in relevant stream from any recognized educational board.',
    keyMilestones: ['Registration Window', 'Subject Exam Windows', 'University CSAS Portals'],
  },
  'CLAT': {
    title: 'Common Law Admission Test (CLAT)',
    type: 'EXAM',
    categoryLabel: 'National Law Exam',
    durationText: '6 Months Prep',
    description: 'National entrance examination for admissions into 24 participating National Law Universities (NLUs) in India.',
    subjects: ['English Comprehension', 'Current Affairs & GK', 'Legal Reasoning', 'Logical Reasoning', 'Quantitative Techniques'],
    eligibilityNote: 'Class 12 pass with at least 45% aggregate marks from any academic stream.',
    keyMilestones: ['December Examination', 'NLU Seat Allocation Rounds', 'Campus Admission'],
  },
  'CA Foundation': {
    title: 'ICAI Chartered Accountancy Foundation',
    type: 'EXAM',
    categoryLabel: 'Professional Accounting Exam',
    durationText: '6 Months Prep',
    description: 'Entry-level examination conducted biannually by the Institute of Chartered Accountants of India (ICAI).',
    subjects: ['Accounting', 'Business Laws', 'Quantitative Aptitude', 'Business Economics'],
    eligibilityNote: 'Registered with ICAI and appeared/passed Class 12 examination.',
    keyMilestones: ['ICAI Registration', 'Foundation Exam (June/Dec)', 'CA Intermediate Registration'],
  },
  'UCEED / NID DAT': {
    title: 'Design Entrance Exams (UCEED / NID DAT)',
    type: 'EXAM',
    categoryLabel: 'National Design Exam',
    durationText: '4 Months Prep',
    description: 'Evaluates visualization, spatial reasoning, environmental sensitivity, and sketching for admission to IITs and NID.',
    subjects: ['Visualization & Spatial Ability', 'Observation & Design Sensitivity', 'Analytical Reasoning', 'Drawing / Sketching'],
    eligibilityNote: 'Class 12 pass from any stream (Science, Commerce, or Arts).',
    keyMilestones: ['National Design Test', 'Studio Test & Portfolio Review', 'Seat Allocation'],
  },
  'IPMAT / CUET': {
    title: 'Integrated Management Aptitude Test / CUET',
    type: 'EXAM',
    categoryLabel: 'Management Gateway Exam',
    durationText: '4 Months Prep',
    description: 'Dual entrance pathway for five-year integrated management programs at IIM Indore, IIM Rohtak, and top central universities.',
    subjects: ['Quantitative Ability', 'Verbal Ability', 'Data Interpretation'],
    eligibilityNote: 'Class 12 pass with minimum 60% aggregate from any stream.',
    keyMilestones: ['Computer Based Test', 'Personal Interview & WAT', 'IIM Merit List'],
  },
  'B.Tech Computer Science & Engineering': {
    title: 'B.Tech in Computer Science & Engineering',
    type: 'COURSE',
    categoryLabel: 'Undergraduate Engineering Degree',
    durationText: '48 Months (4 Years)',
    description: 'Four-year professional degree covering data structures, algorithm design, operating systems, networking, databases, and AI.',
    subjects: ['Data Structures & Algorithms', 'Operating Systems', 'Database Systems', 'Compiler Design', 'Cloud Computing'],
    eligibilityNote: 'Valid JEE Main / State CET rank and Class 12 PCM qualification.',
    keyMilestones: ['Foundation Core Years', 'Industry Internships', 'Capstone Project & Campus Placements'],
  },
  'B.Sc Data Science & Mathematics': {
    title: 'B.Sc in Data Science & Mathematics',
    type: 'COURSE',
    categoryLabel: 'Undergraduate Sciences Degree',
    durationText: '36 Months (3 Years)',
    description: 'Applied quantitative degree emphasizing statistical computing, linear algebra, machine learning modeling, and data pipelines.',
    subjects: ['Linear Algebra', 'Probability & Statistics', 'Machine Learning', 'Big Data Engineering', 'Python/R Analytics'],
    eligibilityNote: 'CUET UG score with Mathematics as mandatory domain subject.',
    keyMilestones: ['Applied Research Projects', 'Data Science Hackathons', 'Industry Analytics Internships'],
  },
  'BCA (Bachelor of Computer Applications)': {
    title: 'Bachelor of Computer Applications (BCA)',
    type: 'COURSE',
    categoryLabel: 'Undergraduate Applications Degree',
    durationText: '36 Months (3 Years)',
    description: 'Practical technology degree focusing on web development, mobile app programming, software engineering, and database systems.',
    subjects: ['Object-Oriented Programming', 'Web Technologies', 'Software Engineering', 'RDBMS', 'Cloud Fundamentals'],
    eligibilityNote: 'Class 12 pass with Mathematics / Computer Applications preferred.',
    keyMilestones: ['Full-Stack Project Submissions', 'Tech Certifications', 'Software Development Internships'],
  },
  'MBBS (Medicine & Surgery)': {
    title: 'Bachelor of Medicine & Bachelor of Surgery (MBBS)',
    type: 'COURSE',
    categoryLabel: 'Clinical Professional Degree',
    durationText: '66 Months (5.5 Years)',
    description: 'Intensive medical degree encompassing 4.5 years of didactic clinical training followed by 1 year of compulsory rotatory internship.',
    subjects: ['Anatomy', 'Physiology', 'Biochemistry', 'Pharmacology', 'Pathology', 'General Medicine', 'Surgery'],
    eligibilityNote: 'NEET UG qualification with high percentile rank and Class 12 PCB.',
    keyMilestones: ['Pre-Clinical Phase', 'Para-Clinical Phase', 'Clinical Rotations', 'Internship & Medical Council Registration'],
  },
  'BDS (Bachelor of Dental Surgery)': {
    title: 'Bachelor of Dental Surgery (BDS)',
    type: 'COURSE',
    categoryLabel: 'Dental Professional Degree',
    durationText: '60 Months (5 Years)',
    description: 'Five-year professional dental program including oral surgery, periodontics, orthodontics, and restorative clinical dentistry.',
    subjects: ['Dental Anatomy', 'Oral Pathology', 'Orthodontics', 'Oral & Maxillofacial Surgery', 'Periodontics'],
    eligibilityNote: 'NEET UG qualification and Class 12 PCB credentials.',
    keyMilestones: ['Pre-Clinical Dentistry', 'Hospital Patient Clinics', 'Compulsory Rotatory Dental Internship'],
  },
  'B.Sc / B.Tech Biotechnology': {
    title: 'B.Sc / B.Tech in Biotechnology',
    type: 'COURSE',
    categoryLabel: 'Undergraduate Biotech Degree',
    durationText: '48 Months (4 Years)',
    description: 'Integrates biological sciences with biochemical engineering, genetic editing, fermentation technology, and drug synthesis.',
    subjects: ['Cell Biology', 'Recombinant DNA Tech', 'Immunology', 'Bioprocess Engineering', 'Downstream Processing'],
    eligibilityNote: 'Class 12 PCB or PCM with CUET UG or JEE Main scores.',
    keyMilestones: ['Wet Lab Practicals', 'Research Institute Internships', 'Biopharma Capstone'],
  },
  'B.Com (Hons) & Articleship': {
    title: 'B.Com (Hons) with ICAI Articleship',
    type: 'COURSE',
    categoryLabel: 'Undergraduate & Professional Training',
    durationText: '36-48 Months',
    description: 'Academic degree combined with 2 years of practical statutory articleship training under a practicing Chartered Accountant.',
    subjects: ['Advanced Accounting', 'Auditing Standards', 'Corporate Law', 'Strategic Financial Management', 'Taxation Laws'],
    eligibilityNote: 'Class 12 Commerce or CA Foundation cleared.',
    keyMilestones: ['CA Inter Both Groups Cleared', '2-Year Mandatory Articleship', 'CA Final Examination'],
  },
  'B.Com (Hons) / BBA Finance': {
    title: 'B.Com (Hons) / BBA in Finance',
    type: 'COURSE',
    categoryLabel: 'Undergraduate Finance Degree',
    durationText: '36 Months (3 Years)',
    description: 'Premier business degree covering corporate valuation, capital budgeting, financial instruments, and investment analysis.',
    subjects: ['Financial Accounting', 'Corporate Finance', 'Investment Analysis', 'Derivatives & Risk', 'Commercial Law'],
    eligibilityNote: 'CUET UG score with Mathematics / Accountancy.',
    keyMilestones: ['Equity Research Reports', 'Summer Investment Banking Internships', 'Placement Rounds'],
  },
  'BBA Business Administration': {
    title: 'Bachelor of Business Administration (BBA)',
    type: 'COURSE',
    categoryLabel: 'Undergraduate Business Degree',
    durationText: '36 Months (3 Years)',
    description: 'Broad business education focusing on marketing strategy, organizational behavior, operations management, and entrepreneurship.',
    subjects: ['Principles of Management', 'Marketing Management', 'Operations Research', 'Financial Management', 'Business Analytics'],
    eligibilityNote: 'Class 12 pass from any academic stream.',
    keyMilestones: ['Live Consulting Projects', 'Corporate Summer Internship', 'Product Strategy Case Competitions'],
  },
  'BA LLB (5-Year Integrated Law)': {
    title: 'BA LLB (5-Year Integrated Law Degree)',
    type: 'COURSE',
    categoryLabel: 'Integrated Professional Law Degree',
    durationText: '60 Months (5 Years)',
    description: 'Integrated dual degree combining liberal arts foundations with exhaustive corporate, constitutional, and criminal jurisprudence.',
    subjects: ['Constitutional Law', 'Contract Law', 'Corporate Governance', 'Intellectual Property Rights', 'Taxation & Competition Law'],
    eligibilityNote: 'CLAT or AILET rank following Class 12 examination.',
    keyMilestones: ['National Moot Court Competitions', 'Law Firm Summer Internships', 'Bar Council of India Enrollment'],
  },
  'BA Political Science / History': {
    title: 'BA in Political Science / History (UPSC Track)',
    type: 'COURSE',
    categoryLabel: 'Undergraduate Social Sciences Degree',
    durationText: '36 Months (3 Years)',
    description: 'Comprehensive humanities curriculum tailored for public policy analysis, Indian constitutional framework, and civil services prep.',
    subjects: ['Indian Government & Politics', 'International Relations', 'Modern Indian History', 'Public Administration', 'Sociology'],
    eligibilityNote: 'CUET UG admission into premier universities.',
    keyMilestones: ['UPSC Syllabus Alignment', 'General Studies Foundation', 'Answer Writing Mastery'],
  },
  'BA / B.Sc Psychology': {
    title: 'BA / B.Sc in Psychology',
    type: 'COURSE',
    categoryLabel: 'Undergraduate Behavioral Degree',
    durationText: '36-48 Months',
    description: 'Foundations of cognitive neuroscience, abnormal psychology, developmental milestones, psychometrics, and research methods.',
    subjects: ['Cognitive Psychology', 'Abnormal Psychology', 'Developmental Psychology', 'Psychological Testing', 'Neuroscience Basics'],
    eligibilityNote: 'Class 12 pass in Humanities or Science stream via CUET UG.',
    keyMilestones: ['Clinical Case Studies', 'Hospital Psychiatry Observerships', 'Preparation for M.Sc / M.Phil'],
  },
  'B.Des (Bachelor of Design)': {
    title: 'Bachelor of Design (B.Des in UI/UX & Interaction)',
    type: 'COURSE',
    categoryLabel: 'Undergraduate Design Degree',
    durationText: '48 Months (4 Years)',
    description: 'Four-year studio-intensive program covering user research, typography, design ergonomics, motion design, and interaction architecture.',
    subjects: ['Interaction Design', 'Visual Hierarchy', 'Typography & Layout', 'User Research & Testing', 'Design Systems'],
    eligibilityNote: 'UCEED / NID DAT qualification and portfolio review.',
    keyMilestones: ['Design Studio Exhibitions', 'Tech Company UX Internships', 'Graduation Showcase'],
  },
};

// Helper: Match node text to icon
function getNodeIcon(nodeTitle: string, index: number, total: number) {
  const t = nodeTitle.toLowerCase();
  if (index === 0 || t.includes('class 10')) return BookOpen;
  if (t.includes('class 12') || t.includes('stream')) return Layers;
  if (t.includes('jee') || t.includes('neet') || t.includes('cuet') || t.includes('clat') || t.includes('exam') || t.includes('foundation') || t.includes('uceed') || t.includes('ipmat')) {
    return Award;
  }
  if (t.includes('b.tech') || t.includes('mbbs') || t.includes('b.sc') || t.includes('bca') || t.includes('b.com') || t.includes('bba') || t.includes('llb') || t.includes('b.des') || t.includes('degree') || t.includes('bds')) {
    return GraduationCap;
  }
  if (index === total - 1) return Briefcase;
  return GitBranch;
}

// Helper: Match node text to badge color
function getNodeBadgeColor(nodeTitle: string, index: number, total: number) {
  const t = nodeTitle.toLowerCase();
  if (index === 0 || t.includes('class 10')) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  if (t.includes('class 12') || t.includes('stream')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  if (t.includes('jee') || t.includes('neet') || t.includes('cuet') || t.includes('clat') || t.includes('exam') || t.includes('foundation') || t.includes('uceed') || t.includes('ipmat')) {
    return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
  }
  if (t.includes('b.tech') || t.includes('mbbs') || t.includes('b.sc') || t.includes('bca') || t.includes('b.com') || t.includes('bba') || t.includes('llb') || t.includes('b.des') || t.includes('degree') || t.includes('bds')) {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  }
  if (index === total - 1) return 'bg-primary/10 text-primary border-primary/30';
  return 'bg-muted text-muted-foreground border-border';
}

// Helper: Match node text to human-readable step title
function getNodeStepType(nodeTitle: string, index: number, total: number): string {
  const t = nodeTitle.toLowerCase();
  if (index === 0 || t.includes('class 10')) return 'Step 1 · Foundational Stage';
  if (t.includes('class 12') || t.includes('stream')) return 'Step 2 · Senior Secondary Stream';
  if (t.includes('jee') || t.includes('neet') || t.includes('cuet') || t.includes('clat') || t.includes('exam') || t.includes('foundation') || t.includes('uceed') || t.includes('ipmat')) {
    return 'Step 3 · Gateway Entrance Exam';
  }
  if (t.includes('b.tech') || t.includes('mbbs') || t.includes('b.sc') || t.includes('bca') || t.includes('b.com') || t.includes('bba') || t.includes('llb') || t.includes('b.des') || t.includes('degree') || t.includes('bds')) {
    return 'Step 4 · Higher Education Degree';
  }
  if (index === total - 1) return `Step ${index + 1} · Target Career Milestone`;
  return `Step ${index + 1} · Educational Node`;
}

interface CareerGraphPageProps {
  initialView?: 'all' | 'saved';
}

export function CareerGraphPage({ initialView = 'all' }: CareerGraphPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selected state
  const [allCareers, setAllCareers] = useState<CareerGraphItem[]>(CAREER_CATALOG);
  const [selectedCareer, setSelectedCareer] = useState<CareerGraphItem>(CAREER_CATALOG[0]);
  const [selectedPathwayIndex, setSelectedPathwayIndex] = useState<number>(0);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewSavedOnly, setViewSavedOnly] = useState<boolean>(initialView === 'saved' || searchParams.get('view') === 'saved');
  const [savedCodes, setSavedCodes] = useState<string[]>(() => careerService.getSavedCareerCodes());
  const [isLoadingPathways, setIsLoadingPathways] = useState<boolean>(false);
  const [livePathwaysMap, setLivePathwaysMap] = useState<Record<string, CareerPathway[]>>({});
  const [showNodeDrawer, setShowNodeDrawer] = useState<boolean>(false);

  // Sync career selection from URL parameter if present
  const careerParam = searchParams.get('career');

  useEffect(() => {
    // 1. Fetch live recommendations to enrich career catalog with actual scores if available
    async function initData() {
      try {
        const res = await careerService.getRecommendations();
        if (res && res.recommendations && res.recommendations.length > 0) {
          // Merge recommendations into catalog
          const merged = CAREER_CATALOG.map((catItem) => {
            const found = res.recommendations.find(
              (r) => r.career_code === catItem.career_code || r.career.toLowerCase() === catItem.career.toLowerCase()
            );
            if (found) {
              return {
                ...catItem,
                compatibilityScore: found.compatibilityScore || catItem.compatibilityScore,
                eligibility: found.eligibility || catItem.eligibility,
                pathways: found.pathways && found.pathways.length > 0 ? found.pathways : catItem.pathways,
                salary_range_inr: found.salary_range_inr || catItem.salary_range_inr,
                skills: found.skills || catItem.skills,
              };
            }
            return catItem;
          });
          setAllCareers(merged);
        }
      } catch (err) {
        console.warn('Career Graph using verified catalog dataset:', err);
      }
    }
    initData();
  }, []);

  // Update selected career when query parameter changes or initial load completes
  useEffect(() => {
    if (careerParam) {
      const match = allCareers.find(
        (c) =>
          c.career_code.toUpperCase() === careerParam.toUpperCase() ||
          c.career.toLowerCase() === careerParam.toLowerCase()
      );
      if (match) {
        setSelectedCareer(match);
        setSelectedPathwayIndex(0);
        setSelectedNodeIndex(0);
        return;
      }
    }
  }, [careerParam, allCareers]);

  // Load server-side verified pathways for selected career if not already cached
  useEffect(() => {
    let isMounted = true;
    async function fetchServerPathways() {
      if (!selectedCareer) return;
      if (livePathwaysMap[selectedCareer.career_code]) return;

      setIsLoadingPathways(true);
      try {
        const res = await careerService.getPathways(selectedCareer.career_code);
        if (isMounted && res && res.pathways && res.pathways.length > 0) {
          setLivePathwaysMap((prev) => ({
            ...prev,
            [selectedCareer.career_code]: res.pathways,
          }));
        }
      } catch {
        // Keep fallback catalog pathways
      } finally {
        if (isMounted) setIsLoadingPathways(false);
      }
    }
    fetchServerPathways();
    return () => {
      isMounted = false;
    };
  }, [selectedCareer, livePathwaysMap]);

  // Determine current active pathways (live if available, else catalog)
  const currentPathways = useMemo(() => {
    if (!selectedCareer) return [];
    const live = livePathwaysMap[selectedCareer.career_code];
    if (live && live.length > 0) return live;
    return selectedCareer.pathways && selectedCareer.pathways.length > 0
      ? selectedCareer.pathways
      : CAREER_CATALOG[0].pathways;
  }, [selectedCareer, livePathwaysMap]);

  const activePathway = currentPathways[selectedPathwayIndex] || currentPathways[0] || {
    pathway_id: 'default',
    title: 'Primary Pathway',
    nodes: ['Class 10', 'Class 12 Stream', 'Entrance Exam', 'Degree Course', selectedCareer.career],
    total_duration_months: 48,
  };

  // Filter careers by domain, search, and saved status
  const domains = useMemo(() => {
    const set = new Set<string>();
    CAREER_CATALOG.forEach((c) => {
      const primaryDomain = c.domain.split('·')[0].trim();
      set.add(primaryDomain);
    });
    return ['All', ...Array.from(set)];
  }, []);

  const filteredCareers = useMemo(() => {
    return allCareers.filter((c) => {
      if (viewSavedOnly && !savedCodes.includes(c.career_code)) {
        return false;
      }
      if (selectedDomain !== 'All') {
        const primaryDomain = c.domain.split('·')[0].trim();
        if (primaryDomain !== selectedDomain) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.career.toLowerCase().includes(q);
        const matchesDomain = c.domain.toLowerCase().includes(q);
        const matchesSkills = c.skills?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesDomain && !matchesSkills) return false;
      }
      return true;
    });
  }, [allCareers, viewSavedOnly, savedCodes, selectedDomain, searchQuery]);

  const handleSelectCareer = (career: CareerGraphItem) => {
    setSelectedCareer(career);
    setSelectedPathwayIndex(0);
    setSelectedNodeIndex(0);
    setSearchParams({ career: career.career_code }, { replace: true });
  };

  const handleToggleSave = (careerCode: string) => {
    careerService.toggleSaveCareerCode(careerCode);
    setSavedCodes(careerService.getSavedCareerCodes());
  };

  const isCurrentSaved = savedCodes.includes(selectedCareer.career_code);

  // Current node inspected
  const currentNodeTitle = activePathway.nodes[selectedNodeIndex] || activePathway.nodes[0];
  const currentNodeDetail: NodeDetailInfo = NODE_DETAILS_MAP[currentNodeTitle] || {
    title: currentNodeTitle,
    type: 'STAGE',
    categoryLabel: getNodeStepType(currentNodeTitle, selectedNodeIndex, activePathway.nodes.length),
    durationText: '12-36 Months',
    description: `Verified milestone in the pathway toward ${selectedCareer.career}. Meets all national educational prerequisites and qualification criteria.`,
    subjects: ['Core Academic Curriculum', 'Prerequisite Competencies'],
    eligibilityNote: 'Standard institutional qualification criteria applies.',
    keyMilestones: ['Academic Coursework', 'Continuous Evaluation', 'Progression Certification'],
  };

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Career Discovery', href: '/career-discovery' },
        { label: 'Career Graph' },
      ]}
      headerRight={
        <div className="flex items-center gap-2">
          <Link to="/career-discovery">
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs font-semibold rounded-lg">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Career Discovery</span>
            </Button>
          </Link>
          <Button
            variant={isCurrentSaved ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToggleSave(selectedCareer.career_code)}
            className="gap-1.5 h-8 text-xs font-semibold rounded-lg"
          >
            {isCurrentSaved ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5 text-primary-foreground fill-current" />
                <span>Saved Pathway</span>
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Save Pathway</span>
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 sm:space-y-8 animate-fade-in text-left pb-12">
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1.5 px-2.5 py-0.5 text-xs font-medium border-primary/30 text-primary bg-primary/5">
                  <GitBranch className="h-3.5 w-3.5" />
                  Verified Pathway Graph
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  12 Forkora Career Node Trajectories
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Interactive Career Graph
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Explore end-to-end educational pathways—from secondary foundation to senior secondary streams, gateway entrance examinations, undergraduate degrees, and target careers.
              </p>
            </div>

            {/* Quick Actions & View Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Button
                variant={viewSavedOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const nextState = !viewSavedOnly;
                  setViewSavedOnly(nextState);
                  if (nextState) {
                    setSearchParams({ view: 'saved' }, { replace: true });
                  } else {
                    setSearchParams({ career: selectedCareer.career_code }, { replace: true });
                  }
                }}
                className="gap-2 h-9 text-xs font-semibold rounded-xl"
              >
                <Bookmark className={`h-4 w-4 ${viewSavedOnly ? 'fill-current' : ''}`} />
                <span>{viewSavedOnly ? 'Showing Saved Paths' : 'Filter Saved Paths'}</span>
                {savedCodes.length > 0 && (
                  <Badge variant={viewSavedOnly ? 'secondary' : 'default'} className="ml-1 h-5 px-1.5 text-[10px]">
                    {savedCodes.length}
                  </Badge>
                )}
              </Button>

              <Link to="/career-discovery">
                <Button variant="outline" size="sm" className="gap-2 h-9 text-xs font-semibold rounded-xl w-full sm:w-auto">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Recommendation Scores</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search & Domain Filter Toolbar */}
          <div className="mt-6 pt-6 border-t border-border/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search career, degree, or exam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-background/80"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Domain Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
                <Filter className="h-3 w-3" />
                Domain:
              </span>
              {domains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                    selectedDomain === domain
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Career Selection Horizontal Carousel / Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              Select Career Node ({filteredCareers.length} Available)
            </h3>
            {viewSavedOnly && (
              <button
                onClick={() => setViewSavedOnly(false)}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Show All Careers
              </button>
            )}
          </div>

          {filteredCareers.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/20">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No careers match your search</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try clearing the search query or switching to 'All' domains.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDomain('All');
                  setViewSavedOnly(false);
                }}
                className="mt-3 text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-muted">
              {filteredCareers.map((c) => {
                const isSelected = selectedCareer.career_code === c.career_code;
                const isSaved = savedCodes.includes(c.career_code);

                return (
                  <button
                    key={c.career_code}
                    onClick={() => handleSelectCareer(c)}
                    className={`shrink-0 flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                        : 'border-border/70 bg-card hover:bg-muted/40 hover:border-border'
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground truncate max-w-[140px] sm:max-w-[180px]">
                          {c.career}
                        </span>
                        {isSaved && <Bookmark className="h-3 w-3 text-primary fill-current" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                          {c.domain.split('·')[0]}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {c.compatibilityScore}% Match
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Career Overview Banner */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {selectedCareer.career}
                </h2>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {selectedCareer.domain}
                </Badge>
                {selectedCareer.eligibility === 'eligible' && (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-xs gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Eligible Profile
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
                {selectedCareer.description}
              </p>
            </div>

            {/* Career Metrics (Salary & Match) */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Est. Median CTC
                </span>
                <span className="text-sm sm:text-base font-extrabold text-foreground flex items-center justify-end gap-0.5">
                  <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                  {(selectedCareer.salary_range_inr.median / 100000).toFixed(1)} LPA
                </span>
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Compatibility Score
                </span>
                <span className="text-sm sm:text-base font-extrabold text-primary">
                  {selectedCareer.compatibilityScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Pathway Switcher Tabs */}
          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1">
                Pathways:
              </span>
              {currentPathways.map((pathway, idx) => {
                const isActive = selectedPathwayIndex === idx;
                return (
                  <button
                    key={pathway.pathway_id || idx}
                    onClick={() => {
                      setSelectedPathwayIndex(idx);
                      setSelectedNodeIndex(0);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-foreground text-background shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60'
                    }`}
                  >
                    <span>{pathway.title || `Pathway ${idx + 1}`}</span>
                    <Badge variant={isActive ? 'outline' : 'secondary'} className={`text-[10px] px-1.5 py-0 h-4 ${isActive ? 'border-background/30 text-background' : ''}`}>
                      {pathway.total_duration_months} mo
                    </Badge>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Total Duration: <strong className="text-foreground">{activePathway.total_duration_months} Months ({(activePathway.total_duration_months / 12).toFixed(1)} Years)</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Visual Graph Canvas: Interactive Node Pipeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              <span>Pathway Visual Progression ({activePathway.nodes.length} Milestones)</span>
            </h3>
            <span className="text-xs text-muted-foreground">
              Click any node card to inspect requirements & curriculum
            </span>
          </div>

          {/* Connected Flow Node Cards */}
          <div className="p-4 sm:p-6 rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/10 shadow-xs">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-2 overflow-x-auto py-2">
              {activePathway.nodes.map((nodeName, idx) => {
                const Icon = getNodeIcon(nodeName, idx, activePathway.nodes.length);
                const badgeColor = getNodeBadgeColor(nodeName, idx, activePathway.nodes.length);
                const stepLabel = getNodeStepType(nodeName, idx, activePathway.nodes.length);
                const isSelected = selectedNodeIndex === idx;
                const isLast = idx === activePathway.nodes.length - 1;

                return (
                  <React.Fragment key={`${nodeName}-${idx}`}>
                    {/* Node Card */}
                    <div
                      onClick={() => {
                        setSelectedNodeIndex(idx);
                        setShowNodeDrawer(true);
                      }}
                      className={`relative flex-1 min-w-[200px] p-4 rounded-xl border transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/40 -translate-y-0.5'
                          : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30'
                      }`}
                    >
                      {/* Step Indicator Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                          {stepLabel.split('·')[0]}
                        </span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4.5 border ${badgeColor}`}>
                          {stepLabel.split('·')[1]?.trim() || 'Milestone'}
                        </Badge>
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-start gap-2.5 mt-2">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2">
                            {nodeName}
                          </h4>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {NODE_DETAILS_MAP[nodeName]?.durationText || 'Standard Duration'}
                          </span>
                        </div>
                      </div>

                      {/* Selection Indicator Pip */}
                      <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                        <span className={isSelected ? 'font-semibold text-primary' : 'text-muted-foreground'}>
                          {isSelected ? 'Active Details' : 'View Scope'}
                        </span>
                        <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? 'text-primary translate-x-0.5' : 'text-muted-foreground'}`} />
                      </div>
                    </div>

                    {/* Connector Arrow (Desktop: horizontal, Mobile: vertical) */}
                    {!isLast && (
                      <div className="flex items-center justify-center py-1 lg:py-0 shrink-0">
                        <div className="hidden lg:flex items-center text-primary/70">
                          <div className="w-4 h-0.5 bg-gradient-to-r from-border to-primary/60" />
                          <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
                        </div>
                        <div className="flex lg:hidden items-center justify-center text-primary/70">
                          <div className="h-4 w-0.5 bg-gradient-to-b from-border to-primary/60" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Node Deep Dive Intelligence Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Active Node Details & Curriculum */}
          <div className="lg:col-span-8 rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                    {currentNodeDetail.categoryLabel}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">
                    {currentNodeDetail.title}
                  </h3>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-semibold border-primary/20 bg-primary/5 text-primary">
                Duration: {currentNodeDetail.durationText}
              </Badge>
            </div>

            {/* Node Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Scope & Curriculum Overview
              </span>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {currentNodeDetail.description}
              </p>
            </div>

            {/* Prerequisites & Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {currentNodeDetail.subjects && currentNodeDetail.subjects.length > 0 && (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    Key Subjects & Modules
                  </span>
                  <ul className="space-y-1.5 text-xs text-foreground/90">
                    {currentNodeDetail.subjects.map((sub, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentNodeDetail.keyMilestones && currentNodeDetail.keyMilestones.length > 0 && (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    Key Milestones & Evaluations
                  </span>
                  <ul className="space-y-1.5 text-xs text-foreground/90">
                    {currentNodeDetail.keyMilestones.map((ms, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>{ms}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Eligibility Note */}
            {currentNodeDetail.eligibilityNote && (
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-foreground">Eligibility Criterion: </span>
                  <span className="text-muted-foreground">{currentNodeDetail.eligibilityNote}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Target Career Intelligence Card */}
          <div className="lg:col-span-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="border-b border-border/60 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Destination Target
              </span>
              <h3 className="text-base font-bold text-foreground mt-0.5">
                {selectedCareer.career}
              </h3>
            </div>

            {/* Required Industry Skills */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Target Competencies & Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCareer.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-medium py-1 px-2.5">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Compensation Spread */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Entry Level</span>
                <span className="font-semibold text-foreground">
                  ₹{(selectedCareer.salary_range_inr.min / 100000).toFixed(1)} LPA
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-primary h-full w-3/4 rounded-full" />
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">Experienced (Top 10%)</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹{(selectedCareer.salary_range_inr.max / 100000).toFixed(1)} LPA
                </span>
              </div>
            </div>

            {/* Quick Navigation Buttons */}
            <div className="space-y-2 pt-2">
              <Link to="/career-discovery" className="w-full block">
                <Button className="w-full gap-2 text-xs font-bold h-9 rounded-xl">
                  <span>Explore All Recommendation Insights</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => handleToggleSave(selectedCareer.career_code)}
                className="w-full gap-2 text-xs font-semibold h-9 rounded-xl"
              >
                {isCurrentSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 text-primary fill-current" />
                    <span>Remove from Saved Pathways</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    <span>Save This Career Pathway</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default CareerGraphPage;
