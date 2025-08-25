import { populateLeagueTeams } from "../scripts/populateLeagues.js";
import type { Sport } from "../utils/constants.utils.js";
import { migrageGameDateFields } from "./fetchGames.js";
import type { Db } from "mongodb";


async function runPhase(db: Db, sport: Sport) {

    // set type of date fields
    await migrageGameDateFields(sport)

    // populate leagues (with list of teams)
    await populateLeagueTeams(db, sport);

}

export default runPhase;
