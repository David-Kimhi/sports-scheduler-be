import runPhase2 from './src/scrapers/football/phase2.scraper.js';
import runPhase1 from './src/scrapers/football/phase1.scraper.js';
import runPhase3 from './src/scrapers/football/phase3.scraper.js';
import { ANALYTICS_DB, SCRAPER_MODULE, SPORT } from './src/config/index.js';
import { getMongoDb, closeMongoDb } from './src/services/mongodb_conn.service.js';

const db = await getMongoDb(SPORT, SCRAPER_MODULE);
const analyticsDb = await getMongoDb(ANALYTICS_DB, SCRAPER_MODULE);

await runPhase1(db);

await runPhase2(db);

await runPhase3(db, analyticsDb);

// close connection
await closeMongoDb(SPORT, SCRAPER_MODULE);
await closeMongoDb(ANALYTICS_DB, SCRAPER_MODULE);

