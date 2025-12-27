import { createLogger } from "../../services/index.js";
import { populateLeagueTeams } from "../../scripts/populateLeagues.js";
import { SCRAPER_MODULE, SPORT } from "../../config/index.js";
import { migrageGameDateFields } from "./fetchGames.js";
import type { Db } from "mongodb";
import { withAsyncLogging } from "../../utils/logging.js";

const logger = createLogger(SCRAPER_MODULE, SPORT)

async function runPhase(db: Db) {

    // set type of date fields
    const migrageGameDateFieldsWLog = withAsyncLogging(migrageGameDateFields, logger)
    await migrageGameDateFieldsWLog()

    // populate leagues (with list of teams)
    const populateLeagueTeamsWLog = withAsyncLogging(populateLeagueTeams, logger)
    await populateLeagueTeamsWLog(db);

}

export default runPhase;
