import type { Request, Response } from 'express';
import { Team } from '../models/Team.js';
import { sendOk } from '../utils/response.js';

interface TeamsQuery {
  season: number;
}

export async function getTeams(req: Request, res: Response): Promise<void> {
  const { season } = req.validated as TeamsQuery;
  const results = await Team.fetchAll('season', season);
  sendOk(res, results);
}

export async function getTeamLogos(req: Request, res: Response): Promise<void> {
  const results = await Team.fetchLogos();
  sendOk(res, results);
}
