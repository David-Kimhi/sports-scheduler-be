import express from 'express';
import gamesRouter from './games.routs.js';
import searchRouter from './search.routs.js'

const router = express.Router();

router.use('/games', gamesRouter); 
router.use('/search', searchRouter);

export default router;
