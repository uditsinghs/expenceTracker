import { formatUtcDate } from '../utils/dates.js';

/**
 * Every document is exposed to the client as `{ id, ... }` with calendar dates
 * serialised as `YYYY-MM-DD`, so the frontend never deals with Mongo internals.
 */
function serializeDocument(_doc: unknown, ret: Record<string, unknown>) {
  ret.id = String(ret._id);
  delete ret._id;
  if (ret.date instanceof Date) ret.date = formatUtcDate(ret.date);
  return ret;
}

export const baseSchemaOptions = {
  timestamps: true,
  versionKey: false as const,
  toJSON: {
    virtuals: true,
    transform: serializeDocument,
  },
};

export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Family',
  'Education',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const UDHAAR_TYPES = ['I_GAVE', 'I_TOOK'] as const;
export type UdhaarType = (typeof UDHAAR_TYPES)[number];

export const UDHAAR_STATUSES = ['PENDING', 'PARTIALLY_PAID', 'SETTLED'] as const;
export type UdhaarStatus = (typeof UDHAAR_STATUSES)[number];

/** Money is rounded to 2 decimals to avoid floating point dust in totals. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
