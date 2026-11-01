import { z } from 'zod';

export const VALID_MODULE_IDS = ['academic', 'aptitude', 'behavioural', 'situational'] as const;

export const moduleIdParamSchema = z.object({
  moduleId: z
    .string({ message: 'Module ID is required' })
    .trim()
    .toLowerCase()
    .refine((val): val is (typeof VALID_MODULE_IDS)[number] => VALID_MODULE_IDS.includes(val as any), {
      message: 'Invalid assessment module ID. Must be one of: academic, aptitude, behavioural, situational',
    }),
});

export const attemptIdParamSchema = z.object({
  attemptId: z.coerce
    .number({ message: 'Attempt ID must be a number' })
    .int('Attempt ID must be an integer')
    .positive('Attempt ID must be a positive integer'),
});

export const saveResponseSchema = z
  .object({
    assigned_question_id: z.coerce
      .number({ message: 'assigned_question_id is required' })
      .int()
      .positive('assigned_question_id must be a valid positive identifier'),
    selected_option_id: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .nullable(),
    selected_option_text: z
      .string()
      .trim()
      .min(1)
      .optional()
      .nullable(),
    response_value: z.coerce
      .number()
      .int('Response value must be an integer')
      .min(1, 'Response value must be between 1 and 5')
      .max(5, 'Response value must be between 1 and 5')
      .optional()
      .nullable(),
  })
  .refine(
    (data) =>
      data.selected_option_id !== undefined ||
      data.selected_option_text !== undefined ||
      data.response_value !== undefined,
    {
      message: 'At least one response value (selected_option_id, selected_option_text, or response_value) is required.',
      path: ['selected_option_id'],
    }
  );

export type SaveResponseInput = z.infer<typeof saveResponseSchema>;
