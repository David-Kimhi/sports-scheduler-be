import { Db, ObjectId } from 'mongodb';

import { API_MODULE, SPORT } from '../config/index.js';
import { Country, Game, League, Team } from '../models/index.js';
import { initializeModels } from '../models/initializer.js';
import { popCol } from '../models/SearchPopularity.js';
import { closeMongoDb, getMongoDb } from '../services/mongodb_conn.service.js';

async function createPrimaryIndexes() {
  await Country.collection.createIndex({ name: 1 }, { unique: true });
  await League.collection.createIndex({ 'league.id': 1 }, { unique: true });
  await Game.collection.createIndex({ 'fixture.id': 1 }, { unique: true });
}

async function cleanupDuplicatesAndIndex() {
  const teams = Team.collection;

  const cursor = teams.aggregate([
    {
      $group: {
        _id: { id: '$team.id', season: '$team.season', league: '$team.league' },
        ids: { $push: '$_id' },
        count: { $sum: 1 }
      }
    },
    { $match: { count: { $gt: 1 } } }
  ]);

  for await (const doc of cursor) {
    const sorted = doc.ids.sort((a: ObjectId, b: ObjectId) =>
      a.getTimestamp().getTime() - b.getTimestamp().getTime()
    );
    sorted.shift();

    if (sorted.length > 0) {
      await teams.deleteMany({ _id: { $in: sorted } });
      console.log(`Removed ${sorted.length} duplicates for`, doc._id);
    }
  }

  await teams.createIndex(
    { 'team.id': 1, 'team.season': 1, 'team.league': 1 },
    { unique: true }
  );

  console.log('Cleanup done. Unique index created.');
}

export async function ensureIndexes(db: Db) {
  await popCol(db).createIndex({ _id: 1 }, { unique: true });
}

async function main() {
  await initializeModels(SPORT, API_MODULE);
  await createPrimaryIndexes();
  await cleanupDuplicatesAndIndex();

  const db = await getMongoDb(SPORT, API_MODULE);
  await ensureIndexes(db);
  await closeMongoDb(SPORT, API_MODULE);
}

main().catch((error) => {
  console.error('❌ Mongo maintenance script failed', error);
  process.exit(1);
});
