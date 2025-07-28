import express from 'express';
import footballApi from '../routs/api.js';
import { API_MODULE, LOCAL_PORT_BACKEND, LOCAL_PORT_FRONTEND, SCRAPER_MODULE, TEAMS_COLL_NAME } from '../config/index.js';
import { Game, Country, League, Team } from '../models/index.js';
import { SPORT, GAMES_COLL_NAME, COUNTRIES_COLL_NAME, LEAGUES_COLL_NAME } from '../config/index.js';
import cors from 'cors';

await Game.init(SPORT, GAMES_COLL_NAME, API_MODULE);
await Country.init(SPORT, COUNTRIES_COLL_NAME, API_MODULE);
await League.init(SPORT, LEAGUES_COLL_NAME, API_MODULE);
await Team.init(SPORT, TEAMS_COLL_NAME, API_MODULE), 

await Country.collection.createIndex({ 'name': 1 }, { unique: true });
await League.collection.createIndex({ 'league.id': 1 }, { unique: true });
await Game.collection.createIndex({ 'fixture.id': 1 }, { unique: true });

import { MongoClient, ObjectId } from "mongodb";
import { closeMongoDb } from '../services/mongodb_conn.service.js';

async function cleanupDuplicatesAndIndex() {
  const teams = Team.collection


  // 1. Aggregate duplicates
  const cursor = teams.aggregate([
    {
      $group: {
        _id: { id: "$team.id", season: "$team.season", league: "$team.league" },
        ids: { $push: "$_id" },
        count: { $sum: 1 }
      }
    },
    { $match: { count: { $gt: 1 } } }
  ]);

  // 2. Iterate duplicates (no deprecated forEach)
  for await (const doc of cursor) {
    // Sort IDs so the oldest stays
    const sorted = doc.ids.sort((a: ObjectId, b: ObjectId) =>
      a.getTimestamp().getTime() - b.getTimestamp().getTime()
    );
    sorted.shift(); // Keep first (oldest)

    // Delete the rest
    if (sorted.length > 0) {
      await teams.deleteMany({ _id: { $in: sorted } });
      console.log(`Removed ${sorted.length} duplicates for`, doc._id);
    }
  }

  // 3. Create the unique index
  await teams.createIndex(
    { "team.id": 1, "team.season": 1, "team.league": 1 },
    { unique: true }
  );

  console.log("Cleanup done. Unique index created.");
}

await cleanupDuplicatesAndIndex().catch(console.error);

await closeMongoDb(SPORT, SCRAPER_MODULE)

