import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ApiError) {
    res.status(error.status).json({ message: error.message, errors: error.details });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string> = {};
    for (const [field, issue] of Object.entries(error.errors)) {
      errors[field] = issue.message;
    }
    res.status(400).json({ message: 'Validation failed', errors });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: `Invalid value for "${error.path}"` });
    return;
  }

  console.error('[error]', error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
