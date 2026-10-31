import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { onboardingSchema, VALID_BOARDS, VALID_STREAMS } from '../validators/onboardingValidator';
import {
  saveOnboardingProfile,
  getOnboardingProfileByUserId,
  updateParentDetails,
} from '../models/onboardingModel';

const updateParentsSchema = z.object({
  father_name: z.string().trim().min(1, "Father's name is required"),
  father_occupation: z.string().trim().optional().nullable(),
  mother_name: z.string().trim().min(1, "Mother's name is required"),
  mother_occupation: z.string().trim().optional().nullable(),
});

/**
 * Submits the complete academic onboarding profile (Sections A, B, and C).
 */
export async function submitOnboarding(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const parseResult = onboardingSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed for onboarding data.',
        errors: parseResult.error.flatten(),
      });
      return;
    }

    const savedProfile = await saveOnboardingProfile(userId, parseResult.data);

    res.status(201).json({
      status: 'success',
      message: 'Academic onboarding completed successfully!',
      data: savedProfile,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves the student's completed onboarding profile and academic details.
 */
export async function getOnboarding(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const profile = await getOnboardingProfileByUserId(userId);

    if (!profile) {
      res.status(200).json({
        status: 'success',
        is_completed: false,
        message: 'Onboarding has not been completed yet.',
        data: null,
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      is_completed: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Updates parent/guardian details (Father & Mother) independently.
 */
export async function updateParents(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required.' });
      return;
    }

    const payload = {
      father_name: req.body.father_name ?? req.body.fatherName ?? req.body.parent_1_name ?? req.body.parent1Name,
      father_occupation: req.body.father_occupation ?? req.body.fatherOccupation ?? req.body.parent_1_occupation ?? req.body.parent1Occupation,
      mother_name: req.body.mother_name ?? req.body.motherName ?? req.body.parent_2_name ?? req.body.parent2Name,
      mother_occupation: req.body.mother_occupation ?? req.body.motherOccupation ?? req.body.parent_2_occupation ?? req.body.parent2Occupation,
    };

    const parseResult = updateParentsSchema.safeParse(payload);
    if (!parseResult.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed for parent details.',
        errors: parseResult.error.flatten(),
      });
      return;
    }

    const result = await updateParentDetails(userId, parseResult.data);

    res.status(200).json({
      status: 'success',
      message: 'Parent details updated successfully!',
      data: result,
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      res.status(404).json({ status: 'error', message: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Returns available boards, streams, and suggested/common subjects by class level.
 */
export function getAcademicCatalog(req: Request, res: Response): void {
  const catalog = {
    boards: VALID_BOARDS,
    streams: VALID_STREAMS,
    branches: {
      branchA: {
        description: 'For Class 10 or below: Common academic subjects and electives',
        targetClasses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        commonSubjects: [
          { name: 'Science', category: 'CORE' },
          { name: 'Mathematics', category: 'CORE' },
          { name: 'Social Science', category: 'CORE' },
          { name: 'English', category: 'CORE' },
        ],
        commonElectives: [
          { name: 'Hindi', category: 'ELECTIVE' },
          { name: 'Computer Science', category: 'ELECTIVE' },
          { name: 'Information Technology', category: 'ELECTIVE' },
          { name: 'Physical Education', category: 'ELECTIVE' },
          { name: 'Sanskrit', category: 'ELECTIVE' },
          { name: 'French', category: 'ELECTIVE' },
        ],
      },
      branchB: {
        description: 'For Class 11 and 12: Stream selection with flexible subject combinations',
        targetClasses: [11, 12],
        streams: [
          {
            stream: 'SCIENCE',
            sampleSubjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English'],
          },
          {
            stream: 'COMMERCE',
            sampleSubjects: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English', 'Informatics Practices'],
          },
          {
            stream: 'HUMANITIES',
            sampleSubjects: ['History', 'Geography', 'Political Science', 'Psychology', 'Sociology', 'Economics', 'English'],
          },
          {
            stream: 'VOCATIONAL',
            sampleSubjects: ['Information Technology', 'Financial Markets Management', 'Tourism', 'Retail', 'English'],
          },
          {
            stream: 'OTHER',
            sampleSubjects: ['English', 'Environmental Studies'],
          },
        ],
      },
    },
  };

  res.status(200).json({
    status: 'success',
    data: catalog,
  });
}
