import { wrapperWrite, writeUpsert, fetchSportData, createLogger } from '../services/index.js'
import { API_SOURCE_NAME, SCRAPER_MODULE } from '../config/index.js'

import { Db } from 'mongodb'
import type { Sport } from '../utils/constants.utils.js';



const dimention = 'leagues'

async function fetchAndStoreLeauges(db: Db, sport: Sport) {
    const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention, sport);

    let leagues = await fetchSportData(sport, dimention)

    if (sport === "basketball") {
      leagues = leagues.map((item: any) => {
        const { country, ...leagueFields } = item;
        return {
          league: leagueFields, // all fields except country
          country,              // keep country as-is
          seasons: [],          // empty
        };
      });
    }

    await wrapperUpsert(leagues, 'league.id', API_SOURCE_NAME);

}

async function fetchCurrentSeason(league: any, sport: Sport): Promise<number> {
  const logger = createLogger(SCRAPER_MODULE, sport);

  const currentSeason = await league.seasons?.find((s: any) => s.current);

  if (!currentSeason) {
    logger.error(`No current season found for league ${league.name}`);
    return -1;
  } else {
    return currentSeason.year
  }

}

export { fetchAndStoreLeauges, fetchCurrentSeason }
