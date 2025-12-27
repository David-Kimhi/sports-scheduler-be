import { API_MODULE, COUNTRIES_COLL_NAME, GAMES_COLL_NAME, LEAGUES_COLL_NAME, TEAMS_COLL_NAME } from '../config/index.js';
import { Country } from './Country.js';
import { Game } from './Game.js';
import { League } from './League.js';
import { Team } from './Team.js';

export async function initializeModels(dbName: string, appName: string = API_MODULE) {
  await Promise.all([
    Game.init(dbName, GAMES_COLL_NAME, appName),
    Country.init(dbName, COUNTRIES_COLL_NAME, appName),
    League.init(dbName, LEAGUES_COLL_NAME, appName),
    Team.init(dbName, TEAMS_COLL_NAME, appName)
  ]);
}
