import runPhase2 from './src/scrapers/football/phase2.scraper.js';
import runPhase1 from './src/scrapers/football/phase1.scraper.js';
import { SCRAPER_MODULE, SPORT } from './src/config/index.js';
import { getMongoDb, closeMongoDb } from './src/services/mongodb_conn.service.js';

const db = await getMongoDb(SPORT, SCRAPER_MODULE);

await runPhase1(db);

await runPhase2(db);

// close connection
await closeMongoDb(SPORT, SCRAPER_MODULE)

