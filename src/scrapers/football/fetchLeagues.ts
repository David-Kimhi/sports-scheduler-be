import { wrapperWrite, writeUpsert, fetchSportData, createLogger } from '../../services/index.js'
import { API_SOURCE_NAME, SCRAPER_MODULE, SPORT } from '../../config/index.js'
import { Db } from 'mongodb'


// create a logger
const logger = createLogger(SCRAPER_MODULE, SPORT);

const dimention = 'leagues'

async function fetchAndStoreLeauges(db: Db) {
    const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention);

    const leagues = await fetchSportData(SPORT, dimention)

    await wrapperUpsert(leagues, 'league.id', API_SOURCE_NAME);

}

async function fetchCurrentSeason(league: any): Promise<number> {
    const currentSeason = await league.seasons?.find((s: any) => s.current);
  
    if (!currentSeason) {
      logger.error(`No current season found for league ${league.name}`);
      return -1;
    } else {
      return currentSeason.year
    }
  
  }

export { fetchAndStoreLeauges, fetchCurrentSeason }
