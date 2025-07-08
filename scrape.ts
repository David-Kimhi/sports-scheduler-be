import * as s from './src/scrapers/football/index.js';
import { FlagsManager, getMongoDb, closeMongoDb} from './src/services/index.js';
import { SPORT } from './src/config/index.js';


const flagsManager = new FlagsManager()

const db = await getMongoDb(SPORT, 'scraper');

flagsManager.resetIfAllTrue();


// Countries
await flagsManager.runOnce("fetchCountries", s.fetchAndStoreCountries, db);

// Leagues
await flagsManager.runOnce("fetchLeagues", s.fetchAndStoreLeauges, db);

// Fixtures
await flagsManager.runOnce("fetchFixtures", s.fetchAndStoreFixtures, db);

// Teams
await flagsManager.runOnce("fetchTeams", s.fetchAndStoreTeams, db)

// close connection
await closeMongoDb(SPORT, 'scraper')

