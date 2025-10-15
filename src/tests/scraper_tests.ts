import { closeMongoDb, getMongoDb } from "../services/index.js";
import { SCRAPER_MODULE, ANALYTICS_DB } from "../config/index.js";
import { getYesterdayBounds } from "../utils/times.utils.js";
import { rullupDay } from "../scrapers/analytics/dailyRollup.analytics.js";

const analyticsDb = await getMongoDb(ANALYTICS_DB, SCRAPER_MODULE)
const yesterdayBounds = getYesterdayBounds();
const [dayStart, dayEnd] = [yesterdayBounds.start, yesterdayBounds.end];
await rullupDay(dayStart, dayEnd, analyticsDb);
await closeMongoDb(ANALYTICS_DB, SCRAPER_MODULE)