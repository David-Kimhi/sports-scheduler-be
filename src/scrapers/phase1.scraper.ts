import * as s from './index.js';
import { FlagsManager } from '../services/index.js';
import { IS_PRO_PLAN } from '../config/index.js';

import type { Db } from 'mongodb';
import type { Sport } from '../utils/constants.utils.js';


const flagsManager = new FlagsManager()

async function runPhase(db: Db, sport: Sport){

    // if is pro plan reset all flags on each run
    const resetAlways = IS_PRO_PLAN
    flagsManager.resetIfAllTrue(resetAlways);


    // Countries
    await flagsManager.runOnce("fetchCountries", s.fetchAndStoreCountries, db, sport);

    // Leagues
    await flagsManager.runOnce("fetchLeagues", s.fetchAndStoreLeauges, db, sport);

    // Fixtures
    await flagsManager.runOnce("fetchFixtures", s.fetchAndStoreFixtures, db, sport);

    // Teams
    await flagsManager.runOnce("fetchTeams", s.fetchAndStoreTeams, db, sport)

}

export default runPhase;


