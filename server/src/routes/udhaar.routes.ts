import { Router } from 'express';
import {
  addRepayment,
  createUdhaar,
  deleteRepayment,
  deleteUdhaar,
  getUdhaar,
  listUdhaar,
  updateUdhaar,
} from '../controllers/udhaar.controller.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  repaymentCreateSchema,
  udhaarCreateSchema,
  udhaarUpdateSchema,
} from '../validation/schemas.js';

export const udhaarRouter = Router();

udhaarRouter.get('/', asyncHandler(listUdhaar));
udhaarRouter.get('/:id', asyncHandler(getUdhaar));
udhaarRouter.post('/', validateBody(udhaarCreateSchema), asyncHandler(createUdhaar));
udhaarRouter.put('/:id', validateBody(udhaarUpdateSchema), asyncHandler(updateUdhaar));
udhaarRouter.delete('/:id', asyncHandler(deleteUdhaar));

udhaarRouter.post(
  '/:id/repayments',
  validateBody(repaymentCreateSchema),
  asyncHandler(addRepayment),
);
udhaarRouter.delete('/:id/repayments/:repaymentId', asyncHandler(deleteRepayment));
