import express from 'express';
import countryRouter from './country.routes.js';
import gamesRouter from './games.routes.js';
import leaguesRouter from './league.routes.js';
import searchRouter from './search.routes.js';
import teamRouter from './team.routes.js';

const router = express.Router();

router.use('/games', gamesRouter); 
router.use('/leagues', leaguesRouter);
router.use('/search', searchRouter);
router.use('/countries', countryRouter);
router.use('/teams', teamRouter);


export default router;
