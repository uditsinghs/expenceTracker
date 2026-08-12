import { Schema, model, type HydratedDocument } from 'mongoose';
import { baseSchemaOptions } from './shared.js';

export interface IncomeAttrs {
  amount: number;
  source: string;
  date: Date;
  description: string;
}

const incomeSchema = new Schema<IncomeAttrs>(
  {
    amount: { type: Number, required: true, min: 0.01 },
    source: { type: String, required: true, trim: true, maxlength: 80 },
    date: { type: Date, required: true },
    description: { type: String, trim: true, maxlength: 300, default: '' },
  },
  baseSchemaOptions,
);

incomeSchema.index({ date: -1 });

export type IncomeDocument = HydratedDocument<IncomeAttrs>;
export const Income = model<IncomeAttrs>('Income', incomeSchema);
