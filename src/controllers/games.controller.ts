import type { Request, Response } from 'express';
import { Game } from '../models/Game.js';
import { sendOk } from '../utils/response.js';
import type { QueryParams } from '../interfaces/models.interface.js';

type GamesQuery = Required<Pick<QueryParams, 'sort' | 'direction' | 'limit' | 'word' | 'field' | 'after'>> &
  Pick<QueryParams, 'from' | 'to'>;

export async function getGames(req: Request, res: Response): Promise<void> {
  const { sort, direction, limit, word, field, after, from, to } = req.validated as GamesQuery;
  const games = await Game.fetchByWord({ word, field, after, sort, direction, limit, from, to });
  sendOk(res, games);
}
