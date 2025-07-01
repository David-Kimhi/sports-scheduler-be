import { MongoClient, Db } from 'mongodb';
import { URI } from './config.js';

type AppDbKey = string; // e.g., 'api:sports' or 'scraper:sports'

const clients: Record<AppDbKey, MongoClient> = {};
const dbs: Record<AppDbKey, Db> = {};

/**
 * Connect to a MongoDB DB for a specific app (api or scraper)
 */
export async function getMongoDb(dbName: string, appName: string = 'api'): Promise<Db> {
  const key = `${appName}:${dbName}`;

  if (dbs[key]) {
    return dbs[key];
  }

  const client = new MongoClient(URI);
  await client.connect();

  const db = client.db(dbName);
  clients[key] = client;
  dbs[key] = db;

  console.log(`[Mongo][${appName}] Connected to database: ${dbName}`);
  return db;
}

export async function closeMongoDb(dbName: string, appName: string): Promise<void> {
  const key = `${appName}:${dbName}`;
  const client = clients[key];

  if (client) {
    await client.close();
    delete clients[key];
    delete dbs[key];
    console.log(`[Mongo][${appName}] Disconnected from database: ${dbName}`);
  }
}

export async function closeAllMongoDbs(appName?: string): Promise<void> {
  for (const key of Object.keys(clients)) {
    if (!appName || key.startsWith(`${appName}:`)) {
      await closeMongoDb(key.split(':')[1], key.split(':')[0]);
    }
  }
}

export function buildFilter(fieldPaths: string, obj: any): object {
  const filter: Record<string, any> = {};

  for (const path of fieldPaths.split(',')) {
    const trimmedPath = path.trim();
    const parts = trimmedPath.split('.');
    let value = obj;

    for (const part of parts) {
      if (value && part in value) {
        value = value[part];
      } else {
        throw new Error(`Field "${trimmedPath}" not found in document.`);
      }
    }

    filter[trimmedPath] = value;
  }

  return filter;
}




