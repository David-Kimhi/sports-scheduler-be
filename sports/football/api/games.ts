import express, { type Request, type Response } from 'express';
import { Game } from '../db/Game.js';

const router = express.Router();

// GET /api/football/games?name=madrid
router.get('/', async (req: Request, res: Response) => {
  const name = req.query.name as string;

  if (!name) {
    res.status(400).json({ error: 'Missing "name" query parameter' });
  }

  try {
    const games = await Game.findByName(name);
    res.json(games);
  } catch (err: any) {
    console.error(`[API][Games] Error fetching games:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
