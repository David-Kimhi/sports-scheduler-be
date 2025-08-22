import express, { type Request, type Response } from 'express';
import { z } from 'zod';
import { createLogger, getMongoDb } from '../services/index.js';
import { Game, Country, League, Team, type GameData, type TeamData, type LeagueData, type CountryData } from '../models/index.js';
import { SPORT, SMALL_L, LARGE_L, API_MODULE, COUNTRIES_COLL_NAME, GAMES_COLL_NAME, TEAMS_COLL_NAME, LEAGUES_COLL_NAME } from '../config/index.js';
import { fetchPopularityMap, incrementPopularity } from '../models/SearchPopularity.js'; 
import { sortByPopularityInMemory } from '../scripts/sortByPopularity.js';


const router = express.Router();

const logger = createLogger('API', SPORT)

const COLLECTIONS = [Game, Country, League, Team];

function toArray<T>(item: T | T[] | null | undefined): T[] {
  if (item == null) return [];
  return Array.isArray(item) ? item : [item];
}

const db = await getMongoDb(SPORT, API_MODULE);

type ResultsByCollection = {
  [GAMES_COLL_NAME]: GameData[];
  [TEAMS_COLL_NAME]: TeamData[];
  [LEAGUES_COLL_NAME]: LeagueData[];
  [COUNTRIES_COLL_NAME]: CountryData[];
};

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
    // Skip games when games=false
    const collectionsToSearch = games
      ? COLLECTIONS 
      : COLLECTIONS.filter((c) => c !== Game);

    if (games) {
      try {
        await Promise.all([
          ...toArray<number>(team).map(id => incrementPopularity(db, TEAMS_COLL_NAME, id)),
          ...toArray<number>(league).map(id => incrementPopularity(db, LEAGUES_COLL_NAME, id)),
          ...toArray<string>(country).map(code => incrementPopularity(db, COUNTRIES_COLL_NAME, code)),
        ]);
      } catch (err) {
        logger.error('[Search Route] Error:', err);
      }

    }

    const searchResults = await Promise.all(
      collectionsToSearch.map(async (model) => {
        const filters: any = {};

        filters.countryIds = toArray(country);

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

        const type = model.collection.collectionName as keyof ResultsByCollection;

        const results = await model.fetchByWord({ word, field, limit, filters });

        switch (type) {
          case TEAMS_COLL_NAME: {
            const arr = results as TeamData[];
            const finalResults = await sortByPopularityInMemory(db, TEAMS_COLL_NAME, arr)
            return { teams: finalResults };
          }
          case LEAGUES_COLL_NAME: {
            const arr = results as LeagueData[];
            const finalResults = await sortByPopularityInMemory(db, LEAGUES_COLL_NAME, arr)
            return { leagues: finalResults };
          }
          case COUNTRIES_COLL_NAME: {
            const arr = results as CountryData[];
            const finalResults = await sortByPopularityInMemory(db, TEAMS_COLL_NAME, arr)
            return { countries: finalResults };
          }
          case GAMES_COLL_NAME: {
            // no popularity sort for games, unless you add one
            return { fixtures: results as GameData[] };
          }
        }
      }
    ));

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
