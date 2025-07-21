import express, { type Request, type Response } from 'express';
import { Team } from '../models/Team.js';
import { createLogger } from '../services/index.js';
import {SPORT, API_MODULE } from '../config/index.js';

const logger = createLogger(API_MODULE, SPORT)

const model = Team;
const router = express.Router();

router.get('/fetchAll', async (req: Request, res: Response) => {

    // TODO: add optional parameter - season number (default now - 2023)
    // Reject if any query parameters are present
    if (Object.keys(req.query).length > 0) {
        res.status(400).json({ error: 'No parameters allowed for this endpoint' });
    }

    try {
        const results = await model.fetchAll();
        res.json(results);
    } catch (err: any) {
        logger.error(`Error fetching teams: ${err}`);
        res.status(500).json({ error: 'Internal server error' });
    }
    
});

export default router;