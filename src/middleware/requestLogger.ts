import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });

  next();
}
