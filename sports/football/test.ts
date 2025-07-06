import { closeMongoDb, getMongoDb } from "../../mongodb/helpers.js";
import { SPORT } from "./config.js";
import { MODULE } from "./scraper/config.js";
import { fetchAndStoreTeams } from "./scraper/services/fetchTeams.js";
import { migrageGameDateFields } from "./scraper/services/fetchGames.js";


const db = await getMongoDb(SPORT, 'Scraper');
await fetchAndStoreTeams(db);

await closeMongoDb(SPORT, 'Scraper')