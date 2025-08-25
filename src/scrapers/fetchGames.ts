import { FREE_YEARS_FOOTBALL, API_SOURCE_NAME, GAMES_COLL_NAME, SCRAPER_MODULE, IS_FREE_PLAN} from '../config/index.js';

import { delayForLimit } from '../utils/index.js';
import { createLogger, FlagsManager, fetchSportData, migrateDateFields, wrapperWrite, writeUpsert, fetchCollection } from '../services/index.js';
import { Db } from 'mongodb';
import { Game } from '../models/index.js';
import { fetchCurrentSeason } from './fetchLeagues.js';
import type { Sport } from '../utils/constants.utils.js';

// create a logger
const dimention = 'fixtures'
const flagsManager = new FlagsManager()


async function handleLeague(league: any, db: Db, year: number, sport: Sport) {
  const logger = createLogger(SCRAPER_MODULE, sport);

  const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention, sport);

  await delayForLimit();


  const params = {
    league: league.league.id,
    season: year,
  };

  let fixtures: any[] = [];

  try {
    fixtures = await fetchSportData(sport, dimention, params);
  } catch (err: any) {
    logger.error(`Error while fetching fixtures for League ID ${league.league.id} | League Name ${league.league.name}`);
  } finally {
    logger.info(`League ID ${league.league.id} | League Name ${league.league.name} | Season ${year} | Fetched ${fixtures.length} games.`);
  }

  if (fixtures.length) {
    await wrapperUpsert(fixtures, 'fixture.id,league.season,league.id', API_SOURCE_NAME);
  }
}

export async function fetchAndStoreFixtures(db: Db, sport: Sport) {
  const logger = createLogger(SCRAPER_MODULE, sport);

  const leagues = await fetchCollection(sport, 'leagues')


  if (!leagues) {
    logger.error('No leagues found');
    return;
  }

  for (const league of leagues) {

    const yearsToFetch = IS_FREE_PLAN ? FREE_YEARS_FOOTBALL : [await fetchCurrentSeason(league, sport)]

    for (const year of yearsToFetch) {
      await flagsManager.runOnce(
        `fetchGamesLeague_${league.league.id}_${year}`,
        () => handleLeague(league, db, year, sport)
      )
    }
  } // end of for (leagues)

}

export async function migrageGameDateFields(sport: Sport){
  await Game.init(sport, GAMES_COLL_NAME, SCRAPER_MODULE);
  await migrateDateFields(Game.collection, Game.dateFields);
}
