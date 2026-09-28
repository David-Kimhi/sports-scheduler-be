import { closeMongoDb, getMongoDb } from "../services/index.js";
import { SCRAPER_MODULE, ANALYTICS_DB } from "../config/index.js";
import { getYesterdayBounds } from "../utils/times.utils.js";
import { rullupDay } from "../scrapers/analytics/dailyRollup.analytics.js";
import runPhase3 from '../scrapers/football/phase3.scraper.js';
import { SPORT } from "../config/index.js";

const db = await getMongoDb(SPORT, SCRAPER_MODULE);
const analyticsDb = await getMongoDb(ANALYTICS_DB, SCRAPER_MODULE);

await runPhase3(db, analyticsDb);

// close connection
await closeMongoDb(SPORT, SCRAPER_MODULE);
await closeMongoDb(ANALYTICS_DB, SCRAPER_MODULE);

