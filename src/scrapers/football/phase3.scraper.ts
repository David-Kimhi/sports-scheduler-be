
import type { Db } from "mongodb";
import { cleanTeams } from "./fetchTeams.js";
import { rullupDay } from "../analytics/dailyRollup.analytics.js";
import { getYesterdayBounds } from "../../utils/times.utils.js";
import { createLogger } from "../../services/logger.service.js";
import { SCRAPER_MODULE } from "../../config/sportsapi.js";
import { SPORT } from "../../config/constants.js";

const logger = createLogger(SCRAPER_MODULE, SPORT)


async function runPhase(db: Db, analyticsDb: Db) {

    // delete teams from old seasons
    await cleanTeams();

    // run analytics:
    const yesterdayBounds = getYesterdayBounds();
    const [dayStart, dayEnd] = [yesterdayBounds.start, yesterdayBounds.end];

    await rullupDay(dayStart, dayEnd, analyticsDb);

}

export default runPhase;
