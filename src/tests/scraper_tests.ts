import { SPORT } from '../config/constants.js'
import { IS_FREE_PLAN, SCRAPER_MODULE } from '../config/sportsapi.js'
import { fetchAndStoreTeams } from '../scrapers/football/fetchTeams.js'
import { getMongoDb } from '../services/mongodb_conn.service.js'

