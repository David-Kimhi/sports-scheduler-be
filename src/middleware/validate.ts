import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError.js';

type Target = 'query' | 'body' | 'params';

/**
 * Returns middleware that validates req[target] against a Zod schema.
 * On success, attaches parsed data to req.validated.
 * On failure, passes an AppError(400) to next().
 */
export function validate(schema: ZodSchema, target: Target = 'query') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(new AppError(400, 'Validation failed', 'VALIDATION_ERROR', result.error.flatten()));
      return;
    }
    req.validated = result.data as Record<string, any>;
    next();
  };
}
