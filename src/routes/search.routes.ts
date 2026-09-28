import express from 'express';
import { z } from 'zod';
import { LARGE_L, SMALL_L } from '../config/index.js';
import { validate } from '../middleware/validate.js';
import { search } from '../controllers/search.controller.js';

const searchQuerySchema = z.object({
  word: z.string().optional().default(''),
  field: z.string().optional().default('name'),
  limit: z.coerce.number().min(1).max(LARGE_L).optional().default(SMALL_L),
  country: z.union([z.string(), z.array(z.string())]).optional(),
  league: z.union([z.coerce.number(), z.array(z.coerce.number())]).optional(),
  team: z.union([z.coerce.number(), z.array(z.coerce.number())]).optional(),
  games: z.coerce.boolean().default(false)
});

const router = express.Router();

router.get('/', validate(searchQuerySchema), search);

export default router;
