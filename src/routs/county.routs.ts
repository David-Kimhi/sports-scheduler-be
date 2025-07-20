import express, { type Request, type Response } from 'express';
import { Country } from '../models/Country.js';
import { createLogger } from '../services/index.js';
import {SPORT, API_MODULE } from '../config/index.js';

const logger = createLogger(API_MODULE, SPORT)

const model = Country;
const router = express.Router();

router.get('/fetchAll', async (req: Request, res: Response) => {

    // Reject if any query parameters are present
    if (Object.keys(req.query).length > 0) {
        res.status(400).json({ error: 'No parameters allowed for this endpoint' });
    }

    try {
        const results = await model.fetchAll();
        res.json(results);
    } catch (err: any) {
        logger.error(`Error fetching countries: ${err}`);
        res.status(500).json({ error: 'Internal server error' });
    }
    
});

export default router;