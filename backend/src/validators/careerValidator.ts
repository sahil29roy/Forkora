import { z } from 'zod';

export const VALID_NODE_TYPES = [
  'EDUCATION_LEVEL',
  'STREAM',
  'EXAM',
  'COURSE',
  'CAREER',
  'SPECIALIZATION',
] as const;

export const VALID_TRANSITION_TYPES = [
  'ACADEMIC',
  'EXAM',
  'DIRECT',
  'LATERAL',
  'CAREER',
] as const;

export const VALID_REVERSIBILITIES = [
  'REVERSIBLE',
  'PARTIALLY_REVERSIBLE',
  'LOCKED_IN',
] as const;

export const VALID_ELIGIBILITY_STATUSES = [
  'ELIGIBLE',
  'CONDITIONALLY_ELIGIBLE',
  'NOT_ELIGIBLE',
] as const;

export const nodeTypeEnum = z.enum(VALID_NODE_TYPES);
export const transitionTypeEnum = z.enum(VALID_TRANSITION_TYPES);
export const reversibilityEnum = z.enum(VALID_REVERSIBILITIES);
export const eligibilityStatusEnum = z.enum(VALID_ELIGIBILITY_STATUSES);

/**
 * Career Node Schema for creation and validation
 */
export const careerNodeSchema = z.object({
  code: z
    .string({ message: 'Node code is required' })
    .trim()
    .min(2, 'Node code must be at least 2 characters')
    .max(100, 'Node code cannot exceed 100 characters')
    .regex(/^[A-Z0-9_]+$/, 'Node code must contain uppercase alphanumeric characters and underscores'),
  title: z
    .string({ message: 'Node title is required' })
    .trim()
    .min(2, 'Node title must be at least 2 characters')
    .max(255, 'Node title cannot exceed 255 characters'),
  node_type: nodeTypeEnum,
  education_level: z
    .string({ message: 'Education level is required' })
    .trim()
    .min(1, 'Education level cannot be empty'),
  stream: z.string().trim().default('ANY'),
  description: z
    .string({ message: 'Description is required' })
    .trim()
    .min(5, 'Description must be at least 5 characters'),
  typical_duration_months: z
    .number()
    .int('Duration must be an integer')
    .min(0, 'Duration cannot be negative')
    .default(0),
  skills: z.array(z.string().trim()).default([]),
  relevant_subjects: z.array(z.string().trim()).default([]),
  salary_range_inr: z
    .object({
      min: z.number().min(0).default(0),
      max: z.number().min(0).default(0),
      median: z.number().min(0).default(0),
    })
    .optional(),
  is_published: z.boolean().default(true),
});

/**
 * Career Edge Schema with self-loop prevention and positive integer checks
 */
export const careerEdgeSchema = z
  .object({
    from_node_id: z
      .number({ message: 'Source node ID is required' })
      .int('Source node ID must be an integer')
      .positive('Source node ID must be a positive integer'),
    to_node_id: z
      .number({ message: 'Destination node ID is required' })
      .int('Destination node ID must be an integer')
      .positive('Destination node ID must be a positive integer'),
    transition_type: transitionTypeEnum.default('ACADEMIC'),
    reversibility: reversibilityEnum.default('REVERSIBLE'),
    min_duration_months: z
      .number()
      .int('Minimum duration must be an integer')
      .min(0, 'Minimum duration cannot be negative')
      .default(0),
    description: z.string().trim().optional().nullable(),
    is_active: z.boolean().default(true),
  })
  .refine((data) => data.from_node_id !== data.to_node_id, {
    message: 'Self-referencing edges are prohibited (from_node_id must differ from to_node_id)',
    path: ['to_node_id'],
  });

/**
 * Graph Traversal Request Query Schema
 */
export const graphTraversalQuerySchema = z
  .object({
    startNodeId: z.coerce.number().int().positive().optional(),
    startCode: z.string().trim().toUpperCase().optional(),
    destinationNodeId: z.coerce.number().int().positive().optional(),
    destinationCode: z.string().trim().toUpperCase().optional(),
    maxDepth: z.coerce.number().int().min(1).max(8).default(5),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    transitionTypes: z
      .union([
        z.string().transform((val) => [val.toUpperCase()]),
        z.array(z.string().transform((val) => val.toUpperCase())),
      ])
      .optional(),
    reversibility: z
      .union([
        z.string().transform((val) => [val.toUpperCase()]),
        z.array(z.string().transform((val) => val.toUpperCase())),
      ])
      .optional(),
  })
  .refine((data) => Boolean(data.startNodeId || data.startCode), {
    message: 'Either startNodeId or startCode must be provided to initiate graph traversal',
    path: ['startNodeId'],
  });
