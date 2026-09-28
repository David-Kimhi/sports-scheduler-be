import type { Request, Response } from 'express';
import { SearchEvent } from '../models/SearchEvent.js';

export async function createSearchEvent(req: Request, res: Response): Promise<void> {
  try {
    const hxff = (req.headers['x-forwarded-for'] as string) ?? '';
    const ip = hxff.split(',')[0].trim() || req.socket.remoteAddress;
    const ua = req.headers['user-agent'] as string | undefined;

    const payload = req.body ?? {};
    await SearchEvent.create({
      ts: payload.ts ? new Date(payload.ts) : undefined,
      query: payload.query,
      filters: payload.filters,
      stage: payload.stage,
      city: payload.clientLoc?.city,
      country: payload.clientLoc?.country,
      countryCode: payload.clientLoc?.countryCode,
      region: payload.clientLoc?.region,
      postcode: payload.clientLoc?.postcode,
      loc: payload.clientLoc?.geo,
      numOfRecords: payload.numOfRecords,
      elapsedMs: payload.elapsedMS,
      ip,
      ua,
      sessionId: payload.sessionId,
      userId: payload.userId
    });

    res.status(204).end();
  } catch {
    // Never block the client because of a failed analytics write
    res.status(200).json({ ok: true });
  }
}
