import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { getTeams, getTeamLogos } from '../controllers/teams.controller.js';

const teamsQuerySchema = z.object({
  season: z.coerce.number().optional().default(2023),
});

const router = express.Router();

router.get('/logos', getTeamLogos);
router.get('/', validate(teamsQuerySchema), getTeams);

export default router;
