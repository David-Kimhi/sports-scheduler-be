import { wrapperWrite, writeUpsert, fetchSportData } from '../../services/index.js'
import { API_SOURCE_NAME, SPORT } from '../../config/index.js'
import { Db } from 'mongodb'

const dimention = 'leagues'

async function fetchAndStoreLeauges(db: Db) {
    const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention);

    const leagues = await fetchSportData(SPORT, dimention)

    await wrapperUpsert(leagues, 'league.id', API_SOURCE_NAME);

}

export { fetchAndStoreLeauges }
