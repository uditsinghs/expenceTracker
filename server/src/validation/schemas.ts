import { z } from 'zod';
import { EXPENSE_CATEGORIES, UDHAAR_TYPES } from '../models/shared.js';

const amount = z
  .number({ invalid_type_error: 'Amount must be a number' })
  .positive('Amount must be greater than 0')
  .max(1_000_000_000, 'Amount is too large');

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const description = z.string().trim().max(300, 'Note is too long').optional().default('');

export const incomeCreateSchema = z.object({
  amount,
  source: z.string().trim().min(1, 'Source is required').max(80, 'Source is too long'),
  date: dateString,
  description,
});
export const incomeUpdateSchema = incomeCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Nothing to update',
);

export const expenseCreateSchema = z.object({
  amount,
  category: z.enum(EXPENSE_CATEGORIES, { errorMap: () => ({ message: 'Category is required' }) }),
  date: dateString,
  description,
});
export const expenseUpdateSchema = expenseCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Nothing to update',
);

export const udhaarCreateSchema = z.object({
  personName: z.string().trim().min(1, 'Person name is required').max(80, 'Name is too long'),
  type: z.enum(UDHAAR_TYPES, { errorMap: () => ({ message: 'Choose "I gave" or "I took"' }) }),
  originalAmount: amount,
  date: dateString,
  description,
});
export const udhaarUpdateSchema = z
  .object({
    personName: z.string().trim().min(1, 'Person name is required').max(80).optional(),
    type: z.enum(UDHAAR_TYPES).optional(),
    originalAmount: amount.optional(),
    date: dateString.optional(),
    description: z.string().trim().max(300).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Nothing to update');

export const repaymentCreateSchema = z.object({
  amount,
  date: dateString,
  note: z.string().trim().max(300).optional().default(''),
});

export type IncomeCreateInput = z.infer<typeof incomeCreateSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type UdhaarCreateInput = z.infer<typeof udhaarCreateSchema>;
export type RepaymentCreateInput = z.infer<typeof repaymentCreateSchema>;
