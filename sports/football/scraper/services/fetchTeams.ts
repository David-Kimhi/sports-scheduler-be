import { fetchCollection } from '../../../../mongodb/fetchers.js';
import { wrapperWrite, writeUpsert } from '../../../../mongodb/writers.js';
import { SPORT, FREE_YEARS_FOOTBALL, API_SOURCE, API_PLAN} from '../config.js';
import { fetchSportData } from '../../../../services/apiSportsFetcher.js';
import { delaySeconds } from '../../../../helpers.js';
import { MODULE } from '../config.js';
import { createLogger } from '../../../../services/logger.js';
import type { IntegerType } from 'mongodb';
import { Db } from 'mongodb';
import { FlagsManager } from '../../../../services/FlagsManager.js';

// create a logger
const logger = createLogger(MODULE, SPORT);

const dimention = 'teams'
const flagsManager = new FlagsManager()


async function handleLeague(league: any, db: Db, customYear?: IntegerType) {
  const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention);

  if (process.env.API_PLAN === "FREE") {
    await delaySeconds(6);
  }

  const currentSeason = league.seasons?.find((s: any) => s.current);

  if (!currentSeason && API_PLAN != "FREE") {
    logger.error(`No current season found for league ${league.name}`);
    return;
  }

  const seasonToFetch = (API_PLAN === "FREE") ? customYear : currentSeason.year;
  const params = {
    league: league.league.id,
    season: seasonToFetch,
  };

  let teams: any[] = [];

  try {
    teams = await fetchSportData(SPORT, dimention, params);
  } catch (err: any) {
    logger.error(`Error while fetching teams for League ID ${league.league.id} | League Name ${league.league.name}`);
  } finally {
    logger.info(`League ID ${league.league.id} | League Name ${league.league.name} | Season ${seasonToFetch} | Fetched ${teams.length} games.`);
  }

  if (teams.length) {
    // add season and leage to each team
    const enrichedTeams = teams.map((item) => ({
        ...item,
        team: {
            ...item.team,
            season: seasonToFetch,
            league: league.league.id,      
        },
        ...item.venue
      }));
    
    await wrapperUpsert(enrichedTeams, 'team.id,team.season,team.league', API_SOURCE);
  }
}

export async function fetchAndStoreTeams(db: Db) {
  const leagues = await fetchCollection(SPORT, 'leagues')


  if (!leagues) {
    logger.error('No leagues found');
    return;
  }

  for (const league of leagues) {

    if (process.env.API_PLAN === "FREE") {
      for (const year of FREE_YEARS_FOOTBALL) {
        await flagsManager.runOnce(
          `fetchTeamsLeague_${league.league.id}_${year}`,
          () => handleLeague(league, db, year)
        )
      }

    } else {
      await flagsManager.runOnce(
        `fetchTeamsLeague_${league.league.id}`,
        () => handleLeague(league, db)
      )
    } // end if-else
  } // end of for (leagues)

}
