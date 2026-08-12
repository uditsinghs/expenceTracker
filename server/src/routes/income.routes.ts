import { Router } from 'express';
import {
  createIncome,
  deleteIncome,
  listIncome,
  updateIncome,
} from '../controllers/income.controller.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { incomeCreateSchema, incomeUpdateSchema } from '../validation/schemas.js';

export const incomeRouter = Router();

incomeRouter.get('/', asyncHandler(listIncome));
incomeRouter.post('/', validateBody(incomeCreateSchema), asyncHandler(createIncome));
incomeRouter.put('/:id', validateBody(incomeUpdateSchema), asyncHandler(updateIncome));
incomeRouter.delete('/:id', asyncHandler(deleteIncome));
