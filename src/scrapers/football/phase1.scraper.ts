import * as s from './index.js';
import { FlagsManager, getMongoDb} from '../../services/index.js';
import { SCRAPER_MODULE, SPORT } from '../../config/index.js';
import type { Db } from 'mongodb';


const flagsManager = new FlagsManager()

async function runPhase(db: Db){

    flagsManager.resetIfAllTrue();


    // Countries
    await flagsManager.runOnce("fetchCountries", s.fetchAndStoreCountries, db);

    // Leagues
    await flagsManager.runOnce("fetchLeagues", s.fetchAndStoreLeauges, db);

    // Fixtures
    await flagsManager.runOnce("fetchFixtures", s.fetchAndStoreFixtures, db);

    // Teams
    await flagsManager.runOnce("fetchTeams", s.fetchAndStoreTeams, db)

}

export default runPhase;


