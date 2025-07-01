import { closeMongoDb } from "../../mongodb/helpers.js";
import { SPORT } from "./config.js";
import { MODULE } from "./scraper/config.js";
import { migrageGameDateFields } from "./scraper/services/fetchGames.js";

await migrageGameDateFields();
await closeMongoDb(SPORT, MODULE)