import type { Request, Response } from 'express';
import { Income } from '../models/Income.js';
import { ApiError } from '../utils/ApiError.js';
import { buildDateFilter, toUtcDate } from '../utils/dates.js';

export async function listIncome(req: Request, res: Response) {
  const dateFilter = buildDateFilter(req.query);
  const filter = dateFilter ? { date: dateFilter } : {};
  const records = await Income.find(filter).sort({ date: -1, createdAt: -1 });
  res.json(records);
}

export async function createIncome(req: Request, res: Response) {
  const { amount, source, date, description } = req.body;
  const record = await Income.create({
    amount,
    source,
    description,
    date: toUtcDate(date),
  });
  res.status(201).json(record);
}

export async function updateIncome(req: Request, res: Response) {
  const record = await Income.findById(req.params.id);
  if (!record) throw ApiError.notFound('Income record not found');

  const { amount, source, date, description } = req.body;
  if (amount !== undefined) record.amount = amount;
  if (source !== undefined) record.source = source;
  if (description !== undefined) record.description = description;
  if (date !== undefined) record.date = toUtcDate(date);

  await record.save();
  res.json(record);
}

export async function deleteIncome(req: Request, res: Response) {
  const record = await Income.findByIdAndDelete(req.params.id);
  if (!record) throw ApiError.notFound('Income record not found');
  res.json({ id: req.params.id, deleted: true });
}
