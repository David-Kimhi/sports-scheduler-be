import express from 'express';
import gamesRouter from './games.js';

const router = express.Router();

router.use('/games', gamesRouter); // Mounts /api/football/games

export default router;
