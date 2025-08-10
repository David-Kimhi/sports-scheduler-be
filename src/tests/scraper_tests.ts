import { populateLeagueTeams } from "../scripts/populateLeagues.js";
import { closeMongoDb, getMongoDb } from "../services/index.js";
import { SPORT, SCRAPER_MODULE } from "../config/index.js";
import { cleanTeams } from "../scrapers/football/fetchTeams.js";

await cleanTeams();
await closeMongoDb(SPORT, SCRAPER_MODULE);

