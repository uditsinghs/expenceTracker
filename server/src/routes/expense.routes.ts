import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
} from '../controllers/expense.controller.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { expenseCreateSchema, expenseUpdateSchema } from '../validation/schemas.js';

export const expenseRouter = Router();

expenseRouter.get('/', asyncHandler(listExpenses));
expenseRouter.post('/', validateBody(expenseCreateSchema), asyncHandler(createExpense));
expenseRouter.put('/:id', validateBody(expenseUpdateSchema), asyncHandler(updateExpense));
expenseRouter.delete('/:id', asyncHandler(deleteExpense));
