import { GAMES_COLL_NAME, SCRAPER_MODULE, SPORT, TEAMS_COLL_NAME } from "../config/index.js";
import { Game, Team } from "../models/index.js";
import { closeMongoDb } from "../services/mongodb_conn.service.js";

await Game.init(SPORT, GAMES_COLL_NAME, SCRAPER_MODULE)
await Game.collection.createIndex({
    "league.id": 1,
    "fixture.date": 1
  });

  await Game.collection.createIndex({
    "teams.home.id": 1,
    "fixture.date": 1
  });

  await Game.collection.createIndex({
    "teams.away.id": 1,
    "fixture.date": 1
  });

  await Game.collection.createIndex({
    "league.country": 1,
    "fixture.date": 1
  });

  await closeMongoDb(SPORT, SCRAPER_MODULE)


