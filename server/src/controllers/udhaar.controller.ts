import type { Request, Response } from 'express';
import { Udhaar, recalculateUdhaar, totalRepaid, type UdhaarDocument } from '../models/Udhaar.js';
import { round2 } from '../models/shared.js';
import { ApiError } from '../utils/ApiError.js';
import { toUtcDate } from '../utils/dates.js';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listUdhaar(req: Request, res: Response) {
  const filter: Record<string, unknown> = {};
  if (typeof req.query.type === 'string' && req.query.type.length > 0) {
    filter.type = req.query.type;
  }
  if (typeof req.query.status === 'string' && req.query.status.length > 0) {
    filter.status = req.query.status;
  }
  if (typeof req.query.search === 'string' && req.query.search.trim().length > 0) {
    const term = escapeRegex(req.query.search.trim());
    filter.$or = [
      { personName: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
    ];
  }

  const records = await Udhaar.find(filter).sort({ date: -1, createdAt: -1 });
  res.json(records);
}

export async function getUdhaar(req: Request, res: Response) {
  const record = await Udhaar.findById(req.params.id);
  if (!record) throw ApiError.notFound('Udhaar record not found');
  res.json(record);
}

export async function createUdhaar(req: Request, res: Response) {
  const { personName, type, originalAmount, date, description } = req.body;
  const record = new Udhaar({
    personName,
    type,
    originalAmount,
    remainingAmount: originalAmount,
    description,
    date: toUtcDate(date),
    repayments: [],
  });
  await record.save();
  res.status(201).json(record);
}

export async function updateUdhaar(req: Request, res: Response) {
  const record = (await Udhaar.findById(req.params.id)) as UdhaarDocument | null;
  if (!record) throw ApiError.notFound('Udhaar record not found');

  const { personName, type, originalAmount, date, description } = req.body;

  if (originalAmount !== undefined) {
    const repaid = totalRepaid(record);
    if (originalAmount < repaid) {
      throw ApiError.badRequest(
        `Amount cannot be less than the ${repaid} already recorded as repaid. Remove a payment first.`,
        { originalAmount: `Must be at least ${repaid}` },
      );
    }
    record.originalAmount = originalAmount;
  }
  if (personName !== undefined) record.personName = personName;
  if (type !== undefined) record.type = type;
  if (description !== undefined) record.description = description;
  if (date !== undefined) record.date = toUtcDate(date);

  await record.save();
  res.json(record);
}

export async function deleteUdhaar(req: Request, res: Response) {
  const record = await Udhaar.findByIdAndDelete(req.params.id);
  if (!record) throw ApiError.notFound('Udhaar record not found');
  res.json({ id: req.params.id, deleted: true });
}

export async function addRepayment(req: Request, res: Response) {
  const record = (await Udhaar.findById(req.params.id)) as UdhaarDocument | null;
  if (!record) throw ApiError.notFound('Udhaar record not found');

  const { amount, date, note } = req.body;
  const remaining = round2(record.originalAmount - totalRepaid(record));

  if (remaining <= 0) {
    throw ApiError.badRequest('This udhaar is already settled.');
  }
  if (amount > remaining) {
    throw ApiError.badRequest(`Payment cannot exceed the remaining ${remaining}.`, {
      amount: `Maximum allowed is ${remaining}`,
    });
  }

  record.repayments.push({ amount, note: note ?? '', date: toUtcDate(date) });
  recalculateUdhaar(record);
  await record.save();
  res.status(201).json(record);
}

export async function deleteRepayment(req: Request, res: Response) {
  const record = (await Udhaar.findById(req.params.id)) as UdhaarDocument | null;
  if (!record) throw ApiError.notFound('Udhaar record not found');

  const repayment = record.repayments.id(req.params.repaymentId);
  if (!repayment) throw ApiError.notFound('Payment entry not found');

  repayment.deleteOne();
  recalculateUdhaar(record);
  await record.save();
  res.json(record);
}
