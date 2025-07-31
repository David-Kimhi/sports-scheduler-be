import { getMongoDb } from "../../services/index.js";
import { populateLeagueTeams } from "../../scripts/populateLeagues.js";
import { SCRAPER_MODULE, SPORT } from "../../config/index.js";
import { migrageGameDateFields } from "./fetchGames.js";
import type { Db } from "mongodb";


async function runPhase(db: Db) {

    // set type of date fields
    await migrageGameDateFields()

    // populate leagues (with list of teams)
    await populateLeagueTeams(db);

}

export default runPhase;
