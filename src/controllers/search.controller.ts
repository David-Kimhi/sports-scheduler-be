import type { Request, Response } from 'express';
import {
  Game, Country, League, Team,
  type GameData, type TeamData, type LeagueData, type CountryData
} from '../models/index.js';
import {
  SPORT, API_MODULE,
  COUNTRIES_COLL_NAME, GAMES_COLL_NAME, TEAMS_COLL_NAME, LEAGUES_COLL_NAME
} from '../config/index.js';
import { getMongoDb } from '../services/index.js';
import { incrementPopularity } from '../models/SearchPopularity.js';
import { sortByPopularityInMemory } from '../utils/sortByPopularity.js';
import { sendOk } from '../utils/response.js';

type ResultsByCollection = {
  [GAMES_COLL_NAME]: GameData[];
  [TEAMS_COLL_NAME]: TeamData[];
  [LEAGUES_COLL_NAME]: LeagueData[];
  [COUNTRIES_COLL_NAME]: CountryData[];
};

interface SearchQuery {
  word: string;
  field: string;
  limit: number;
  country?: string | string[];
  league?: number | number[];
  team?: number | number[];
  games: boolean;
}

function toArray<T>(item: T | T[] | null | undefined): T[] {
  if (item == null) return [];
  return Array.isArray(item) ? item : [item];
}

const COLLECTIONS = [Game, Country, League, Team];

export async function search(req: Request, res: Response): Promise<void> {
  const { word, field, limit, country, league, team, games } = req.validated as SearchQuery;

  const db = await getMongoDb(SPORT, API_MODULE);

  const collectionsToSearch = games
    ? COLLECTIONS
    : COLLECTIONS.filter((c) => c !== Game);

  if (games) {
    await Promise.all([
      ...toArray<number>(team).map(id => incrementPopularity(db, TEAMS_COLL_NAME, id)),
      ...toArray<number>(league).map(id => incrementPopularity(db, LEAGUES_COLL_NAME, id)),
      ...toArray<string>(country).map(code => incrementPopularity(db, COUNTRIES_COLL_NAME, code)),
    ]).catch(() => {});
  }

  // Resolve country codes → country names in one batched pass
  const countryCodes = toArray<string>(country);
  let countryNames: string[] = [];
  if (countryCodes.length > 0) {
    const results = await Promise.all(
      countryCodes.map(code => Country.fetchByWord({ word: code, filters: {}, field: 'code' }))
    );
    countryNames = results.flatMap(r => r.map(c => c.name));
  }

  const searchResults = await Promise.all(
    collectionsToSearch.map(async (model) => {
      const filters = {
        countryIds: countryNames,
        leagueIds: toArray<number>(league),
        teamIds: toArray<number>(team),
      };

      const type = model.collection.collectionName as keyof ResultsByCollection;
      const results = await model.fetchByWord({ word, field, limit, filters });

      switch (type) {
        case TEAMS_COLL_NAME: {
          const finalResults = await sortByPopularityInMemory(db, TEAMS_COLL_NAME, results as TeamData[]);
          return { teams: finalResults };
        }
        case LEAGUES_COLL_NAME: {
          const finalResults = await sortByPopularityInMemory(db, LEAGUES_COLL_NAME, results as LeagueData[]);
          return { leagues: finalResults };
        }
        case COUNTRIES_COLL_NAME: {
          const finalResults = await sortByPopularityInMemory(db, COUNTRIES_COLL_NAME, results as CountryData[]);
          return { countries: finalResults };
        }
        case GAMES_COLL_NAME:
          return { fixtures: results as GameData[] };
      }
    })
  );

  const merged = Object.assign({}, ...searchResults) as ResultsByCollection;

  if (!games) {
    (merged as any)[Game.collection.collectionName] = [];
  }

  sendOk(res, merged);
}
