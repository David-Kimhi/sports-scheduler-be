import express, { type Request, type Response } from 'express';
import { z } from 'zod';
import { createLogger } from '../services/index.js';
import { Game, Country, League, Team } from '../models/index.js';
import { SPORT, SMALL_L, LARGE_L } from '../config/index.js';


const router = express.Router();

const logger = createLogger('API', SPORT)

const COLLECTIONS = [Game, Country, League, Team];

const querySchema = z.object({
  word: z.string().optional().default(''),
  field: z.string().optional().default('name'),
  limit: z.coerce.number().min(1).max(LARGE_L).optional().default(SMALL_L),
  country: z.union([z.string(), z.array(z.string())]).optional(),
  league: z.union([z.coerce.number(), z.array(z.coerce.number())]).optional(),
  team: z.union([z.coerce.number(), z.array(z.coerce.number())]).optional(),
  games: z.coerce.boolean().default(false)
});


router.get('/', async (req: Request, res: Response) => {
  const parseResult = querySchema.safeParse(req.query);

  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
    return;
  }

  const { word, field, limit, country, league, team, games } = parseResult.data;

  try {
    // Build the collections dynamically
    const collectionsToSearch = games
      ? COLLECTIONS // Search all collections
      : COLLECTIONS.filter((c) => c !== Game); // Skip games when games=false

    const searchResults = await Promise.all(
      collectionsToSearch.map(async (model) => {
        const filters: any = {};

        filters.countryIds = country
          ? (Array.isArray(country) ? country : [country])
          : [];

        // Fetch country names for these codes (if any)
        let countryNames: string[] = [];
        if (filters.countryIds.length > 0) {
          for (const code of filters.countryIds) {
            const countryResult = await Country.fetchByWord({
              word: code,
              filters: {},
              field: 'code',
            });
            if (countryResult.length > 0) {
              countryNames.push(countryResult[0].name);
            }
          }
        }

        // Replace codes with country names
        filters.countryIds = countryNames;
        filters.leagueIds = league
          ? (Array.isArray(league) ? league : [league])
          : [];
        filters.teamIds = team
          ? (Array.isArray(team) ? team : [team])
          : [];

        const results = await model.fetchByWord({ word, field, limit, filters });
        return { [model.collection.collectionName]: results };
      })
    );

    // Merge all results
    const mergedResults = Object.assign({}, ...searchResults);

    // Ensure we always include a `games` key (empty array if not searched)
    if (!games) {
      mergedResults[Game.collection.collectionName] = [];
    }

    res.json(mergedResults);
  } catch (err) {
    logger.error('[Search Route] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;
