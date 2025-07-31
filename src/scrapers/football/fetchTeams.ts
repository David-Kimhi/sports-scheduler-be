import { 
  wrapperWrite
  , writeUpsert
  , fetchCollection
  , fetchSportData
  , createLogger
  , FlagsManager 
} from '../../services/index.js';
import { SPORT, FREE_YEARS_FOOTBALL, API_SOURCE_NAME, SCRAPER_MODULE, IS_FREE_PLAN, IS_PRO_PLAN, FREE_RPM, PRO_RPM} from '../../config/index.js';
import { delayForLimit } from '../../utils/index.js';
import type { IntegerType } from 'mongodb';
import { Db } from 'mongodb';
import { fetchCurrentSeason } from './fetchLeagues.js';

// create a logger
const logger = createLogger(SCRAPER_MODULE, SPORT);

const dimention = 'teams'
const flagsManager = new FlagsManager()


async function handleLeague(league: any, db: Db, year: number) {
  const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention);

  await delayForLimit();

  const params = {
    league: league.league.id,
    season: year,
  };

  let teams: any[] = [];

  try {
    teams = await fetchSportData(SPORT, dimention, params);
  } catch (err: any) {
    logger.error(`Error while fetching teams for League ID ${league.league.id} | League Name ${league.league.name}`);
  } finally {
    logger.info(`League ID ${league.league.id} | League Name ${league.league.name} | Season ${year} | Fetched ${teams.length} teams.`);
  }

  if (teams.length) {
    // add season and leage to each team
    const enrichedTeams = teams.map((item) => ({
        team: {
            ...item.team,
            season: year,
            league: league.league.id,      
        },
        venue: {...item.venue}
      }));
    
    await wrapperUpsert(enrichedTeams, 'team.id,team.season,team.league', API_SOURCE_NAME);
  }
}

export async function fetchAndStoreTeams(db: Db) {
  const leagues = await fetchCollection(SPORT, 'leagues')


  if (!leagues) {
    logger.error('No leagues found');
    return;
  }

  for (const league of leagues) {

    const yearsToFetch = IS_FREE_PLAN ? FREE_YEARS_FOOTBALL : [await fetchCurrentSeason(league)]

    for (const year of yearsToFetch) {
      await flagsManager.runOnce(
        `fetchTeamsLeague_${league.league.id}_${year}`,
        () => handleLeague(league, db, year)
      )
    }
    
  } // end of for (leagues)

}
