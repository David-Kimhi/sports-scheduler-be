import { populateLeagueTeams } from "../scripts/populateLeagues.js";
import { closeMongoDb, getMongoDb } from "../services/index.js";
import { SPORT, SCRAPER_MODULE } from "../config/index.js";


const db = await getMongoDb(SPORT, SCRAPER_MODULE);
await populateLeagueTeams(db);
await closeMongoDb(SPORT, SCRAPER_MODULE);

