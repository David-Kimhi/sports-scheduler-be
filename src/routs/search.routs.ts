import express, { type Request, type Response } from 'express';
import { z } from 'zod';
import { createLogger } from '../services/index.js';
import { Game, Country, League } from '../models/index.js';
import { SPORT, SMALL_L, LARGE_L } from '../config/index.js';


const router = express.Router();

const logger = createLogger('API', SPORT)

const COLLECTIONS = [Game, Country, League];

// Zod schema for query params
const querySchema = z.object({
  query: z.string().min(1, 'Query must be a non-empty string'),
  limit: z.coerce.number().min(1).max(LARGE_L).optional().default(SMALL_L)
});

router.get('/', async (req: Request, res: Response) => {
    const parseResult = querySchema.safeParse(req.query);

    if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
        return;
    }

    const { query, limit } = parseResult.data;
    try {

    const searchResults = await Promise.all(
        COLLECTIONS.map(async (model) => {
            const results = await model.getByName({name: query, limit: limit})
            return { [model.collection.collectionName]: results };
        })
    );

    const mergedResults = Object.assign({}, ...searchResults);
    res.json(mergedResults);
  } catch (err) {
    logger.error('[Search Route] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
