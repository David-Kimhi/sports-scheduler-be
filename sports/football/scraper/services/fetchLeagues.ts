import { fetchSportData } from '../../../../services/apiSportsFetcher.js'
import { wrapperWrite, writeUpsert } from '../../../../mongodb/writers.js'
import { SPORT } from '../config.js'
import { Db } from 'mongodb'

const dimention = 'leagues'

async function fetchAndStoreLeauges(db: Db) {
    const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention);


    const leagues = await fetchSportData(SPORT, dimention)

    await wrapperUpsert(leagues, 'league.id');

}

export { fetchAndStoreLeauges }
