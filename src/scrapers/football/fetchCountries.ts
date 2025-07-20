import { wrapperWrite, writeUpsert, createLogger, fetchSportData} from '../../services/index.js'
import { API_SOURCE_NAME, SCRAPER_MODULE, SPORT } from '../../config/index.js';
import { Db } from 'mongodb';

const cwd = process.cwd();
const dimension = 'countries';
const logger = createLogger(SCRAPER_MODULE, SPORT);

async function fetchAndStoreCountries(db: Db) {
    const wrapperUpsert = wrapperWrite(writeUpsert, db, dimension);

    const countries = await fetchSportData(SPORT, dimension)

    await wrapperUpsert(countries, 'name', API_SOURCE_NAME);

}

export { fetchAndStoreCountries }

