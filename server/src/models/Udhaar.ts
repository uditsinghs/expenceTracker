import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';
import { formatUtcDate } from '../utils/dates.js';
import {
  UDHAAR_STATUSES,
  UDHAAR_TYPES,
  baseSchemaOptions,
  round2,
  type UdhaarStatus,
  type UdhaarType,
} from './shared.js';

export interface Repayment {
  amount: number;
  date: Date;
  note: string;
}

export interface UdhaarAttrs {
  personName: string;
  type: UdhaarType;
  originalAmount: number;
  /** Derived from originalAmount minus repayments - never set directly by clients. */
  remainingAmount: number;
  status: UdhaarStatus;
  date: Date;
  description: string;
  repayments: Types.DocumentArray<Repayment>;
}

const repaymentSchema = new Schema<Repayment>(
  {
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true },
    note: { type: String, trim: true, maxlength: 300, default: '' },
  },
  {
    timestamps: true,
    versionKey: false as const,
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        if (ret.date instanceof Date) ret.date = formatUtcDate(ret.date);
        return ret;
      },
    },
  },
);

const udhaarSchema = new Schema<UdhaarAttrs>(
  {
    personName: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, required: true, enum: UDHAAR_TYPES },
    originalAmount: { type: Number, required: true, min: 0.01 },
    remainingAmount: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: UDHAAR_STATUSES, default: 'PENDING' },
    date: { type: Date, required: true },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    repayments: { type: [repaymentSchema], default: [] },
  },
  baseSchemaOptions,
);

udhaarSchema.index({ status: 1, date: -1 });
udhaarSchema.index({ personName: 1 });

export type UdhaarDocument = HydratedDocument<UdhaarAttrs>;

export function totalRepaid(doc: UdhaarDocument): number {
  return round2(doc.repayments.reduce((sum, entry) => sum + entry.amount, 0));
}

/** Keeps `remainingAmount` and `status` consistent with the repayment history. */
export function recalculateUdhaar(doc: UdhaarDocument): UdhaarDocument {
  const repaid = totalRepaid(doc);
  const remaining = round2(Math.max(doc.originalAmount - repaid, 0));

  doc.remainingAmount = remaining;
  if (remaining <= 0) {
    doc.status = 'SETTLED';
  } else if (repaid > 0) {
    doc.status = 'PARTIALLY_PAID';
  } else {
    doc.status = 'PENDING';
  }
  return doc;
}

udhaarSchema.pre('save', function (next) {
  recalculateUdhaar(this as unknown as UdhaarDocument);
  next();
});

export const Udhaar = model<UdhaarAttrs, Model<UdhaarAttrs>>('Udhaar', udhaarSchema);
