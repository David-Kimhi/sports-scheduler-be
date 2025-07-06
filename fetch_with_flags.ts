import { fetchAndStoreCountries } from './sports/football/scraper/services/fetchCountries.js'
import {  fetchAndStoreLeauges } from './sports/football/scraper/services/fetchLeagues.js'
import { fetchAndStoreFixtures } from './sports/football/scraper/services/fetchGames.js';
import { FlagsManager } from './services/FlagsManager.js';
import { SPORT, MODULE } from './sports/football/scraper/config.js';
import { getMongoDb, closeMongoDb} from './mongodb/helpers.js';
import { fetchAndStoreTeams } from './sports/football/scraper/services/fetchTeams.js';

const flagsManager = new FlagsManager()

const db = await getMongoDb(SPORT, MODULE);

flagsManager.resetIfAllTrue();


// Countries
await flagsManager.runOnce("fetchCountries", fetchAndStoreCountries, db);

// Leagues
await flagsManager.runOnce("fetchLeagues", fetchAndStoreLeauges, db);

// Fixtures
await flagsManager.runOnce("fetchFixtures", fetchAndStoreFixtures, db);

// Teams
await flagsManager.runOnce("fetchTeams", fetchAndStoreTeams, db)

// close connection
await closeMongoDb(SPORT, MODULE)

