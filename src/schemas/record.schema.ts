import { z } from 'zod';

export const createRecordSchema = z.object({
  amount: z
    .number()
    .int('Amount must be an integer (in cents)')
    .positive('Amount must be a positive number'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must be at most 100 characters')
    .trim(),
  date: z
    .string()
    .min(1, 'Date is required')
    .datetime({ message: 'Date must be a valid ISO 8601 datetime string' }),
  notes: z
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .trim()
    .optional()
    .nullable(),
});

export const updateRecordSchema = z.object({
  amount: z
    .number()
    .int('Amount must be an integer (in cents)')
    .positive('Amount must be a positive number')
    .optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must be at most 100 characters')
    .trim()
    .optional(),
  date: z
    .string()
    .datetime({ message: 'Date must be a valid ISO 8601 datetime string' })
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .trim()
    .optional()
    .nullable(),
});

export const recordQuerySchema = z.object({
  startDate: z
    .string()
    .datetime({ message: 'startDate must be a valid ISO 8601 datetime string' })
    .optional(),
  endDate: z
    .string()
    .datetime({ message: 'endDate must be a valid ISO 8601 datetime string' })
    .optional(),
  category: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const recordIdParamSchema = z.object({
  id: z.string().uuid('Invalid record ID format'),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type RecordQueryInput = z.infer<typeof recordQuerySchema>;
