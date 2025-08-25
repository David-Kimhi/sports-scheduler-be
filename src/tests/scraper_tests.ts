import { closeMongoDb, getMongoDb } from "../services/index.js";
import { SCRAPER_MODULE } from "../config/index.js";

import type { Sport } from "../utils/constants.utils.js";
import { fetchAndStoreCountries } from "../scrapers/fetchCountries.js";
import type { Db } from "mongodb";
import { fetchAndStoreLeauges } from "../scrapers/fetchLeagues.js";
import { fetchAndStoreTeams } from "../scrapers/fetchTeams.js";

const sport: Sport = "basketball"

const db: Db = await getMongoDb(sport, SCRAPER_MODULE)
// await fetchAndStoreCountries(db, sport)
// await fetchAndStoreLeauges(db, sport)
await fetchAndStoreTeams(db, sport)
// await cleanTeams(sport);
// await closeMongoDb(sport, SCRAPER_MODULE);

await closeMongoDb(sport, SCRAPER_MODULE)
