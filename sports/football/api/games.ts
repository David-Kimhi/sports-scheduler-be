import express, { type Request, type Response } from 'express';
import { Game } from '../db/Game.js';
import { GAMES_COLL_NAME, SPORT } from '../config.js';
import z from 'zod';
import { LARGE_L, SMALL_L, logger } from './config.js';

const router = express.Router();
Game.init(SPORT, GAMES_COLL_NAME, 'api')


async function handleGamesReq(req: Request, res: Response) {

    const querySchema = z.object({
        sort: z.enum(['date', 'name']).optional().default('date'),
        direction: z.enum(['asc', 'desc']).optional().default('desc'),
        limit: z.coerce.number().min(1).max(LARGE_L).optional().default(SMALL_L),
        name: z.string().optional().default(''),
        after: z.preprocess(
            (val) => (val ? new Date(val as string) : new Date()),
            z.date()
        ),
        from: z.preprocess(
            (val) => (typeof val === 'string' ? new Date(val) : undefined),
            z.date().optional()
        ),
        to: z.preprocess(
            (val) => (typeof val === 'string' ? new Date(val) : undefined),
            z.date().optional()
        )
    });
    
    const result = querySchema.safeParse(req.query);
    
    if (!result.success) {
        const error = res.status(400).json({ error: result.error.flatten() });
        logger.error(error);
        return;
    }
    
    const { sort, direction, limit, name, after, from, to} = result.data;

    try {
        const games = await Game.getGames(name, after, sort, direction, limit);
        res.json(games);
      } catch (err: any) {
        logger.error(`Error fetching games: ${err}`);
        res.status(500).json({ error: 'Internal server error' });
      }


  
}

// GET /api/football/games?name=madrid
router.get('/', handleGamesReq);

export default router;
