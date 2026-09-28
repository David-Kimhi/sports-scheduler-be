import express from 'express';
import { z } from 'zod';
import { LARGE_L, SMALL_L } from '../config/index.js';
import { validate } from '../middleware/validate.js';
import { getLeagues, getLeagueLogos } from '../controllers/leagues.controller.js';

const leaguesQuerySchema = z.object({
  word: z.string().optional(),
  field: z.enum(['name', 'country']).optional().default('name'),
  limit: z.coerce.number().min(1).max(LARGE_L).optional().default(SMALL_L),
});

const router = express.Router();

// Must be registered before any future /:id routes
router.get('/logos', getLeagueLogos);
router.get('/', validate(leaguesQuerySchema), getLeagues);

export default router;
