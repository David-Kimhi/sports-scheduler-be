import { fetchAndStoreCountries } from './sports/football/fetchCountries.js'
import {  fetchAndStoreLeauges } from './sports/football/fetchLeagues.js'
import { fetchAndStoreFixtures } from './sports/football/fetchGames.js';
import { runOnce, resetFlags } from './sports/football/flags.js';
import { SPORT, MODULE } from './sports/football/config.js';
import { getMongoDb, closeMongoDb} from '../../mongodb/helpers.js';


// resetFlags();

const db = await getMongoDb(SPORT, MODULE);


// Countries
await runOnce("fetchCountries", fetchAndStoreCountries, db);

// Leagues
await runOnce("fetchLeagues", fetchAndStoreLeauges, db);

// Fixtures
await runOnce("fetchFixtures", fetchAndStoreFixtures, db);

// close connection
await closeMongoDb(SPORT, MODULE)

