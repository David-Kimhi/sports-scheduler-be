import * as s from './index.js';
import { FlagsManager, getMongoDb} from '../../services/index.js';
import { IS_PRO_PLAN, SCRAPER_MODULE, SPORT } from '../../config/index.js';
import type { Db } from 'mongodb';


const flagsManager = new FlagsManager()

async function runPhase(db: Db){

    // if is pro plan reset all flags on each run
    const resetAlways = IS_PRO_PLAN
    flagsManager.resetIfAllTrue(resetAlways);


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


