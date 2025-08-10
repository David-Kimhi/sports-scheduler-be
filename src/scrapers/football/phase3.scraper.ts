
import type { Db } from "mongodb";
import { cleanTeams } from "./fetchTeams.js";


async function runPhase(db: Db) {

    // delete teams from old seasons
    await cleanTeams();
}

export default runPhase;
