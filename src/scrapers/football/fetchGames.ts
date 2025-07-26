import { SPORT, FREE_YEARS_FOOTBALL, API_SOURCE_NAME, GAMES_COLL_NAME, SCRAPER_MODULE, IS_FREE_PLAN, FREE_RPM, IS_PRO_PLAN, PRO_RPM} from '../../config/index.js';
import { delayForLimit } from '../../utils/index.js';
import { createLogger, FlagsManager, fetchSportData, migrateDateFields, wrapperWrite, writeUpsert, fetchCollection } from '../../services/index.js';
import type { IntegerType } from 'mongodb';
import { Db } from 'mongodb';
import { Game } from '../../models/index.js';

// create a logger
const logger = createLogger(SCRAPER_MODULE, SPORT);

const dimention = 'fixtures'
const flagsManager = new FlagsManager()


async function handleLeague(league: any, db: Db, customYear?: IntegerType) {
  const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention);

  await delayForLimit();

  const currentSeason = league.seasons?.find((s: any) => s.current);

  if (!currentSeason) {
    logger.error(`No current season found for league ${league.name}`);
    return;
  }

  const seasonToFetch = (IS_FREE_PLAN) ? customYear : currentSeason.year;
  const params = {
    league: league.league.id,
    season: seasonToFetch,
  };

  let fixtures: any[] = [];

  try {
    fixtures = await fetchSportData(SPORT, dimention, params);
  } catch (err: any) {
    logger.error(`Error while fetching fixtures for League ID ${league.league.id} | League Name ${league.league.name}`);
  } finally {
    logger.info(`League ID ${league.league.id} | League Name ${league.league.name} | Season ${seasonToFetch} | Fetched ${fixtures.length} games.`);
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

    if (IS_FREE_PLAN) {
      for (const year of FREE_YEARS_FOOTBALL) {
        await flagsManager.runOnce(
          `fetchGamesLeague_${league.league.id}_${year}`,
          () => handleLeague(league, db, year)
        )
      }

    } else {
      await flagsManager.runOnce(
        `fetchGamesLeague_${league.league.id}`,
        () => handleLeague(league, db)
      )
    } // end if-else
  } // end of for (leagues)

}

export async function migrageGameDateFields(){
  await Game.init(SPORT, GAMES_COLL_NAME, SCRAPER_MODULE);
  await migrateDateFields(Game.collection, Game.dateFields);
}