import type { Response } from 'express';

export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export function sendOk<T>(res: Response, data: T, meta?: Record<string, unknown>): void {
  const body: ApiSuccess<T> = { data };
  if (meta) body.meta = meta;
  res.json(body);
}
