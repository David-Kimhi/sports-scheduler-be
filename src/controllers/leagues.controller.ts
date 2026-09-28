import type { Request, Response } from 'express';
import { League } from '../models/League.js';
import { sendOk } from '../utils/response.js';

interface LeaguesQuery {
  word?: string;
  field: 'name' | 'country';
  limit: number;
}

export async function getLeagues(req: Request, res: Response): Promise<void> {
  const { word, field, limit } = req.validated as LeaguesQuery;
  const results = word
    ? await League.fetchByWord({ word, field, limit })
    : await League.fetchAll();
  sendOk(res, results);
}

export async function getLeagueLogos(req: Request, res: Response): Promise<void> {
  const results = await League.fetchLogos();
  sendOk(res, results);
}
