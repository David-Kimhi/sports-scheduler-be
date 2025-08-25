
import type { Db } from "mongodb";
import { cleanTeams } from "./fetchTeams.js";
import type { Sport } from "../utils/constants.utils.js";


async function runPhase(sport: Sport) {

    // delete teams from old seasons
    await cleanTeams(sport);
}

export default runPhase;
