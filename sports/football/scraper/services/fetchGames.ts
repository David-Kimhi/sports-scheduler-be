import { fetchCollection } from '../../../../mongodb/fetchers.js';
import { wrapperWrite, writeUpsert } from '../../../../mongodb/writers.js';
import { SPORT, FIRST_LOAD, FREE_YEARS_FOOTBALL} from '../config.js';
import { fetchSportData } from '../../../../services/apiSportsFetcher.js';
import { delaySeconds } from '../../../../helpers.js';
import { MODULE } from '../config.js';
import { createLogger } from '../../../../services/logger.js';
import type { IntegerType } from 'mongodb';
import { Db } from 'mongodb';
import { FlagsManager } from '../../../../services/FlagsManager.js';

const cwd = process.cwd();

// create a logger
const logger = createLogger(cwd, MODULE, SPORT);

const dimention = 'fixtures'
const flagsManager = new FlagsManager(cwd)


async function handleLeague(league: any, db: Db, customYear?: IntegerType) {
  const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention);

  if (process.env.API_PLAN === "FREE") {
    await delaySeconds(6);
  }

  const currentSeason = league.seasons?.find((s: any) => s.current);

  if (!currentSeason) {
    logger.error(`No current season found for league ${league.name}`);
    return;
  }

  const seasonToFetch = (process.env.API_PLAN === "FREE") ? customYear : currentSeason.year;
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
    await wrapperUpsert(fixtures, 'fixture.id,league.season,league.id');
  }
}

export async function fetchAndStoreFixtures(db: Db, specific_season?: number | null) {
  const leagues = await fetchCollection(SPORT, 'leagues')


  if (!leagues) {
    logger.error('No leagues found');
    return;
  }

  for (const league of leagues) {

    if (process.env.API_PLAN === "FREE") {
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
    } // end if
  } // end of for (leagues)
}