import { fetchCollection } from '../../../../mongodb/fetchers.js';
import { wrapperWrite, writeUpsert } from '../../../../mongodb/writers.js';
import { SPORT, FIRST_LOAD} from './config.js';
import { fetchSportData } from '../../apiFetcher.js';
import { delaySeconds} from '../../utils.js';
import { MODULE } from './config.js';
import { createLogger } from '../../../../logger.js';

// create a logger for writing actions
const logger = createLogger(`${MODULE}-fetchGames`);

const dimention = 'fixtures'

const wrapperUpsert = wrapperWrite(writeUpsert, SPORT, dimention);


async function fetchAndStoreFixtures(specific_season?: number | null) {
  const leagues = await fetchCollection(SPORT, 'leagues')


  if (!leagues) {
    logger.error('No leagues found');
    return;
  }

  for (const league of leagues) {

    // wait 6 seconds in free plan (since it's limited to 10 requests per minute)
    if (process.env.API_PLAN === "FREE") {
      await delaySeconds(6);
    }

    const currentSeason = league.seasons?.find((s: any) => s.current);

    if (!currentSeason) {
      logger.error(`No current season found for league ${league.name}`);
      continue;
    }

    const seasonToFetch = (process.env.API_PLAN === "FREE") ? 2021 : currentSeason.year
    const params = {league: league.league.id, season: seasonToFetch}
    
    let fixtures = [];
    try {
      fixtures = await fetchSportData(SPORT, dimention, params);
    } catch (err: any) {
      logger.error(`Error while fetching fixtures for League ID ${league.league.id} | League Name ${league.league.name}:\n`)
    } finally {
      logger.info(`League ID ${league.league.id} | League Name ${league.league.name} | Season ${seasonToFetch} | Fetched ${fixtures.length} games.`);
    }

    // insert if fixtures exist
    fixtures.length && wrapperUpsert(fixtures, 'fixture.id,league.season,league.id');

  }// end for

}


fetchAndStoreFixtures()