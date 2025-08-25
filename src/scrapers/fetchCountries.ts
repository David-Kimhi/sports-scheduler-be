import { wrapperWrite, writeUpsert, fetchSportData} from '../services/index.js'
import { API_SOURCE_NAME, COUNTRIES_COLL_NAME } from '../config/index.js';

import { Db } from 'mongodb';
import type { Sport } from '../utils/constants.utils.js';

const dimension = COUNTRIES_COLL_NAME;

async function fetchAndStoreCountries(db: Db, sport: Sport) {
    const wrapperUpsert = wrapperWrite(writeUpsert, db, dimension, sport);

    const countries = await fetchSportData(sport, dimension)

    await wrapperUpsert(countries, 'name', API_SOURCE_NAME);

}

export { fetchAndStoreCountries }

