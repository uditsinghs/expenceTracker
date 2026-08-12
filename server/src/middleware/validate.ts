import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

/** Replaces `req.body` with the parsed/normalised value or throws a 400 with field errors. */
export function validateBody<T extends ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || 'form';
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      next(ApiError.badRequest(result.error.issues[0]?.message ?? 'Invalid data', fieldErrors));
      return;
    }
    req.body = result.data as z.infer<T>;
    next();
  };
}
