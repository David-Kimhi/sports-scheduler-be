import express from 'express';
import gamesRouter from './games.routs.js';
import searchRouter from './search.routs.js';
import leaguesRouter from './league.routs.js';
import countryRouter from './county.routs.js';
import teamRouter from './team.routs.js';

const router = express.Router();

router.use('/games', gamesRouter); 
router.use('/leagues', leaguesRouter);
router.use('/search', searchRouter);
router.use('/countries', countryRouter);
router.use('/teams', teamRouter);

export default router;
