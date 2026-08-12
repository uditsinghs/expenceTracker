import { Schema, model, type HydratedDocument } from 'mongoose';
import { EXPENSE_CATEGORIES, baseSchemaOptions, type ExpenseCategory } from './shared.js';

export interface ExpenseAttrs {
  amount: number;
  category: ExpenseCategory;
  date: Date;
  description: string;
}

const expenseSchema = new Schema<ExpenseAttrs>(
  {
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, enum: EXPENSE_CATEGORIES },
    date: { type: Date, required: true },
    description: { type: String, trim: true, maxlength: 300, default: '' },
  },
  baseSchemaOptions,
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1, date: -1 });

export type ExpenseDocument = HydratedDocument<ExpenseAttrs>;
export const Expense = model<ExpenseAttrs>('Expense', expenseSchema);
