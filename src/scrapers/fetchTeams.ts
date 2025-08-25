import { 
  wrapperWrite
  , writeUpsert
  , fetchCollection
  , fetchSportData
  , createLogger
  , FlagsManager 
} from '../services/index.js';
import { FREE_YEARS_FOOTBALL, API_SOURCE_NAME, SCRAPER_MODULE, IS_FREE_PLAN, IS_PRO_PLAN, FREE_RPM, PRO_RPM, TEAMS_COLL_NAME} from '../config/index.js';
import { delayForLimit } from '../utils/index.js';
import type { IntegerType } from 'mongodb';
import { Db } from 'mongodb';
import { fetchCurrentSeason } from './fetchLeagues.js';
import { Team } from '../models/Team.js';
import type { Sport } from '../utils/constants.utils.js';

// create a logger

const dimention = 'teams'
const flagsManager = new FlagsManager()


async function handleLeague(league: any, db: Db, year: number, sport: Sport) {
  const logger = createLogger(SCRAPER_MODULE, sport);

  const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention, sport);

  await delayForLimit();

  const params = {
    league: league.league.id,
    season: year,
  };

  let teams: any[] = [];

  try {
    teams = await fetchSportData(sport, dimention, params);
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

export async function fetchAndStoreTeams(db: Db, sport: Sport) {
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
        `fetchTeamsLeague_${league.league.id}_${year}`,
        () => handleLeague(league, db, year, sport)
      )
    }
    
  } // end of for (leagues)

}

export async function cleanTeams(sport: Sport) {
  await Team.init(sport, TEAMS_COLL_NAME, SCRAPER_MODULE);

  const { id, league, season } = Team.teamDocMap;


  const pipeline = [
    {
      $sort: { [season]: -1 }  // sort by most recent season
    },
    {
      $group: {
        _id: {
          id: `$${id}`,
          league: `$${league}`
        },
        keepId: { $first: '$_id' }
      }
    }
  ];
  
  const result = await Team.collection.aggregate(pipeline).toArray();
  const idsToKeep = result.map(doc => doc.keepId);

  await Team.collection.deleteMany({
    _id: { $nin: idsToKeep }
  })
  
}
