import { fetchSportData } from '../../../../services/apiSportsFetcher.js';
import { downloadImage } from '../../../../helpers.js';
import { wrapperWrite, writeUpsert } from '../../../../mongodb/writers.js'
import { API_SOURCE, MODULE, SPORT } from '../config.js';
import { Db } from 'mongodb';
import { createLogger } from '../../../../services/logger.js';

const cwd = process.cwd();
const dimension = 'countries';
const logger = createLogger(MODULE, SPORT);

async function fetchAndStoreCountries(db: Db) {
    const wrapperUpsert = wrapperWrite(writeUpsert, db, dimension);

    const countries = await fetchSportData(SPORT, dimension)

    await wrapperUpsert(countries, 'name', API_SOURCE);

}

export { fetchAndStoreCountries }

