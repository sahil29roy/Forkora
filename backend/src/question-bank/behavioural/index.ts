import behaviouralAssessmentData from './behavioural_assessment.json';
import behaviouralQuestionsData from './behavioural_questions.json';

export interface BehaviouralResponseScaleOption {
  score: number;
  response: string;
}

export interface BehaviouralQuestion {
  id: number;
  category: string;
  topic: string;
  question: string;
  statement: string;
  options: string[];
  scale: BehaviouralResponseScaleOption[];
}

export interface BehaviouralAssessmentMetadata {
  title: string;
  instruction: string;
  response_scale: BehaviouralResponseScaleOption[];
  categories: string[];
  questions: BehaviouralQuestion[];
}

export const BEHAVIOURAL_INSTRUCTION =
  'Read each statement carefully and select the option that best describes you. There are no right or wrong answers. Answer honestly based on how you usually think, feel or behave.';

export const BEHAVIOURAL_RESPONSE_SCALE: BehaviouralResponseScaleOption[] = [
  { score: 1, response: 'Strongly Disagree' },
  { score: 2, response: 'Disagree' },
  { score: 3, response: 'Neither Agree nor Disagree' },
  { score: 4, response: 'Agree' },
  { score: 5, response: 'Strongly Agree' },
];

export const BEHAVIOURAL_CATEGORIES = [
  'Problem-solving and critical thinking',
  'Creativity and curiosity',
  'Teamwork and communication',
  'Independence and initiative',
  'Adaptability and resilience',
  'Learning and work preferences',
] as const;

export const behaviouralAssessment: BehaviouralAssessmentMetadata = behaviouralAssessmentData as BehaviouralAssessmentMetadata;
export const behaviouralQuestions: BehaviouralQuestion[] = behaviouralQuestionsData as BehaviouralQuestion[];

export default behaviouralAssessment;
