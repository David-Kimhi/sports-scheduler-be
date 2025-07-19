import express, { type Request, type Response } from 'express';
import { Game } from '../models/Game.js';
import z from 'zod';
import { createLogger } from '../services/index.js';
import { LARGE_L, SMALL_L, GAMES_COLL_NAME, SPORT } from '../config/index.js';

const logger = createLogger('API', SPORT)

const router = express.Router();

async function handleGamesReq(req: Request, res: Response) {

    const querySchema = z.object({
        sort: z.enum(['date', 'name']).optional().default('date'),
        direction: z.enum(['asc', 'desc']).optional().default('desc'),
        limit: z.coerce.number().min(1).max(LARGE_L).optional().default(SMALL_L),
        word: z.string().optional().default(''),
        field: z.string().optional().default('name'),
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
    
    const { sort, direction, limit, word, field, after, from, to} = result.data;

    try {
        const games = await Game.fetchByWord({word, field, after, sort, direction, limit});
        res.json(games);
    } catch (err: any) {
        logger.error(`Error fetching games: ${err}`);
        res.status(500).json({ error: 'Internal server error' });
      }


  
}

// GET /api/football/games?name=madrid
router.get('/', handleGamesReq);

export default router;
