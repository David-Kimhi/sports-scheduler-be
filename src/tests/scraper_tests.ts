import { populateLeagueTeams } from "../scripts/populateLeagues.js";
import { closeMongoDb, getMongoDb } from "../services/index.js";
import { SPORT, SCRAPER_MODULE, IS_PRO_PLAN } from "../config/index.js";
import { cleanTeams } from "../scrapers/football/fetchTeams.js";

await cleanTeams();
await closeMongoDb(SPORT, SCRAPER_MODULE);

import { FlagsManager } from "../services/index.js";

const flasgsManager = new FlagsManager();


console.log(IS_PRO_PLAN)

