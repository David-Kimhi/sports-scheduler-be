import { fetchSportData } from '../../apiFetcher.js'
import { wrapperWrite, writeUpsert } from '../../../../mongodb/writers.js'
import { SPORT } from './config.js'

const dimention = 'leagues'

const wrapperUpsert = wrapperWrite(writeUpsert, SPORT, dimention);

async function fetchAndStoreLeauges() {

    const leagues = await fetchSportData(SPORT, dimention)

    await wrapperUpsert(leagues, 'league.id');

}

export { fetchAndStoreLeauges }
