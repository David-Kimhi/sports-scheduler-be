// installed modules
import { Db, Collection,} from 'mongodb';
import os from 'os';
import type { 
  Document
  , OptionalUnlessRequiredId
  , BulkWriteResult
  , InsertOneResult
  , InsertManyResult 
} from 'mongodb';
import pLimit from 'p-limit';

// local files
import { buildFilter } from '../utils/index.js';
import { createLogger } from './logger.service.js';
import { SPORT } from '../config/index.js';

const logger = createLogger('MongoDB', SPORT)



// limit writes to mongoDB to 1 in paralel
const limitWrites = pLimit(1); 


/**
 * A generic type representing a write function that performs operations
 * on a MongoDB collection.
 * 
 * @template T - The document type that extends MongoDB's Document.
 */
type WriteFunction<T extends Document> = (collection: Collection<T>, ...args: any[]) => Promise<any>;

/**
 * Wraps a write function with MongoDB connection and collection access.
 * Automatically connects to MongoDB, executes the write operation,
 * and closes the connection afterward.
 * 
 * @template T - The document type.
 * @param fn - A function that performs write operations on a collection.
 * @param dbName - The name of the database.
 * @param collectionName - The name of the collection.
 * @returns A wrapped version of the write function with MongoDB access.
 */
export function wrapperWrite<T extends Document>(
  fn: WriteFunction<T>,
  db: Db,
  collectionName: string,
  appName: string = 'scraper'
): (...args: any[]) => Promise<any> {
  return async function (...args: any[]): Promise<any> {
    const collection = db.collection<T>(collectionName);

    return limitWrites( () => fn(collection, ...args).then(
        results => logWriteResult(results)
      ).catch(
        err => logger.error(`Write error:`, err)
      )
    )
    };
}

/**
 * Performs an upsert operation (update if exists, otherwise insert)
 * on a list of documents using a specified match field.
 * 
 * @template T - The document type.
 * @param collection - MongoDB collection.
 * @param data - Array of documents to upsert.
 * @param matchField - Field used to match existing documents.
 */
export async function writeUpsert<T extends Document>(
  collection: Collection<T>,
  data: T[],
  matchField: string,
  source?: string
): Promise<BulkWriteResult> {
  const enrichedData = data.map(doc => ({
    ...doc,
    ingestion_info: {
      fetched_at: new Date(),
      source: source ?? 'unknown',
      inserted_by: os.hostname()
    }
  }));

  const ops = enrichedData.map(doc => {
    const filter = buildFilter(matchField, doc);
    return {
      replaceOne: {
        filter,
        replacement: doc,
        upsert: true
      }
    };
  });

  return await collection.bulkWrite(ops);
}


/**
 * Inserts one or many documents into a MongoDB collection.
 * 
 * @template T - The document type.
 * @param collection - MongoDB collection.
 * @param data - A single document or array of documents to insert.
 */
export async function writeInsert<T extends Document>(
  collection: Collection<T>,
  data: T | T[]
): Promise<InsertOneResult<T> | InsertManyResult<T>> {

  let result: InsertOneResult | InsertManyResult;

  if (Array.isArray(data)) {
    result = await collection.insertMany(data as OptionalUnlessRequiredId<T>[]);
    logger.info(`Inserted ${result.insertedCount} documents`);
  } else {
    result = await collection.insertOne(data as OptionalUnlessRequiredId<T>);
    logger.info(`Inserted 1 document with ID: ${result.insertedId}`);
  }

  return result;
}

function logWriteResult(result: any) {
  if ('insertedCount' in result || 'upsertedCount' in result) {
    logger.info(`Write result:
      Inserted: ${result.insertedCount || 0},
      Matched: ${result.matchedCount || 0},
      Modified: ${result.modifiedCount || 0},
      Upserted: ${result.upsertedCount || 0},
      Deleted: ${result.deletedCount || 0}
    `);
  } else {
    logger.error('Write operation completed, no summary available.');
  }
}


export async function migrateDateFields(
  collection: Collection,
  dateFields: string[]
) {

  const setObj: Record<string, any> = {};
  for (const field of dateFields) {
    setObj[field] = { $toDate: `$${field}` };
  }

  const result = await collection.updateMany(
    {
      $or: dateFields.map((field) => ({ [field]: { $type: 'string' } }))
    },
    [{ $set: setObj }]
  );

  console.log(`✅ Converted ${result.modifiedCount} documents`);
}

