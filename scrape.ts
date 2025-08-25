import runPhase2 from './src/scrapers/phase2.scraper.js';
import runPhase1 from './src/scrapers/phase1.scraper.js';
import runPhase3 from './src/scrapers/phase3.scraper.js';
import { SCRAPER_MODULE } from './src/config/index.js';
import { getMongoDb, closeMongoDb } from './src/services/mongodb_conn.service.js';
import type { Sport } from './src/utils/constants.utils.js';

const ft_sport: Sport = "football";
const bskt_sport: Sport = "basketball"


for (const sport of [ft_sport, bskt_sport]) {
    const db = await getMongoDb(sport, SCRAPER_MODULE);
    await runPhase1(db, sport);

    await runPhase2(db, sport);

    await runPhase3(sport);

    // close connection
    await closeMongoDb(sport, SCRAPER_MODULE)

}



