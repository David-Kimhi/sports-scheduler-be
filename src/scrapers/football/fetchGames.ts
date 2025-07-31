import { SPORT, FREE_YEARS_FOOTBALL, API_SOURCE_NAME, GAMES_COLL_NAME, SCRAPER_MODULE, IS_FREE_PLAN, FREE_RPM, IS_PRO_PLAN, PRO_RPM} from '../../config/index.js';
import { delayForLimit } from '../../utils/index.js';
import { createLogger, FlagsManager, fetchSportData, migrateDateFields, wrapperWrite, writeUpsert, fetchCollection } from '../../services/index.js';
import { Db } from 'mongodb';
import { Game } from '../../models/index.js';
import { fetchCurrentSeason } from './fetchLeagues.js';

// create a logger
const logger = createLogger(SCRAPER_MODULE, SPORT);

const dimention = 'fixtures'
const flagsManager = new FlagsManager()


async function handleLeague(league: any, db: Db, year: number) {
  const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention);

  await delayForLimit();


  const params = {
    league: league.league.id,
    season: year,
  };

  let fixtures: any[] = [];

  try {
    fixtures = await fetchSportData(SPORT, dimention, params);
  } catch (err: any) {
    logger.error(`Error while fetching fixtures for League ID ${league.league.id} | League Name ${league.league.name}`);
  } finally {
    logger.info(`League ID ${league.league.id} | League Name ${league.league.name} | Season ${year} | Fetched ${fixtures.length} games.`);
  }

  if (fixtures.length) {
    await wrapperUpsert(fixtures, 'fixture.id,league.season,league.id', API_SOURCE_NAME);
  }
}

export async function fetchAndStoreFixtures(db: Db) {
  const leagues = await fetchCollection(SPORT, 'leagues')


  if (!leagues) {
    logger.error('No leagues found');
    return;
  }

  for (const league of leagues) {

    const yearsToFetch = IS_FREE_PLAN ? FREE_YEARS_FOOTBALL : [await fetchCurrentSeason(league)]

    for (const year of yearsToFetch) {
      await flagsManager.runOnce(
        `fetchGamesLeague_${league.league.id}_${year}`,
        () => handleLeague(league, db, year)
      )
    }
  } // end of for (leagues)

}

export async function migrageGameDateFields(){
  await Game.init(SPORT, GAMES_COLL_NAME, SCRAPER_MODULE);
  await migrateDateFields(Game.collection, Game.dateFields);
}