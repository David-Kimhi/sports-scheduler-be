import express from 'express';
import { z } from 'zod';
import { LARGE_L, SMALL_L } from '../config/index.js';
import { validate } from '../middleware/validate.js';
import { getGames } from '../controllers/games.controller.js';

const gamesQuerySchema = z.object({
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

const router = express.Router();

router.get('/', validate(gamesQuerySchema), getGames);

export default router;
