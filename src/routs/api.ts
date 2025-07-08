import express from 'express';
import gamesRouter from './games.routs.js';

const router = express.Router();

router.use('/games', gamesRouter); 

export default router;
