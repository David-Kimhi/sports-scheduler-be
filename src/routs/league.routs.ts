import express, { type Request, type Response } from 'express';
import { API_MODULE, LEAGUES_COLL_NAME, SPORT } from "../config";
import { createLogger } from "../services";
import { League, type LeagueData } from '../models';
import { z } from 'zod';

const logger = createLogger(API_MODULE, SPORT);

const router = express.Router();

const model = League

const allowFields = ["name", "country"] as const satisfies (keyof LeagueData)[]

// Zod schema for query params
const querySchema = z.object({
    word: z.string({
        required_error: "field is required",      
        invalid_type_error: "field must be a string" 
    }).min(1, "field cannot be empty"),
    field: z.enum(allowFields).optional().default('name')
})


router.get('/', async (req: Request, res: Response) => {

    const parseResult = querySchema.safeParse(req.query);

    if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
        return;
    }

    const { word, field } = parseResult.data;
    try {
        const results = await model.fetchByWord({word, field});
        res.json(results);
  } catch (err) {
    logger.error('[Search Route] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }

});

export default router;