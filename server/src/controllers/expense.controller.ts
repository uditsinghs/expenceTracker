import type { Request, Response } from 'express';
import { Expense } from '../models/Expense.js';
import { ApiError } from '../utils/ApiError.js';
import { buildDateFilter, toUtcDate } from '../utils/dates.js';

export async function listExpenses(req: Request, res: Response) {
  const dateFilter = buildDateFilter(req.query);
  const filter: Record<string, unknown> = {};
  if (dateFilter) filter.date = dateFilter;
  if (typeof req.query.category === 'string' && req.query.category.length > 0) {
    filter.category = req.query.category;
  }

  const records = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
  res.json(records);
}

export async function createExpense(req: Request, res: Response) {
  const { amount, category, date, description } = req.body;
  const record = await Expense.create({
    amount,
    category,
    description,
    date: toUtcDate(date),
  });
  res.status(201).json(record);
}

export async function updateExpense(req: Request, res: Response) {
  const record = await Expense.findById(req.params.id);
  if (!record) throw ApiError.notFound('Expense not found');

  const { amount, category, date, description } = req.body;
  if (amount !== undefined) record.amount = amount;
  if (category !== undefined) record.category = category;
  if (description !== undefined) record.description = description;
  if (date !== undefined) record.date = toUtcDate(date);

  await record.save();
  res.json(record);
}

export async function deleteExpense(req: Request, res: Response) {
  const record = await Expense.findByIdAndDelete(req.params.id);
  if (!record) throw ApiError.notFound('Expense not found');
  res.json({ id: req.params.id, deleted: true });
}
