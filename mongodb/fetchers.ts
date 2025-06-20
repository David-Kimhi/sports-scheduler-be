import { MongoClient, type Document, type WithId,} from 'mongodb';
import { URI } from './config.js';
import { MODULE } from './config.js';
import { createLogger } from '../logger.js';


// create a logger for writing actions
const logger = createLogger(`${MODULE}-fetchers`);

const client = new MongoClient(URI);

export async function fetchCollection(db_name: string, collection_name: string) {
    let data: WithId<Document>[]  | null = null
    try {
        await client.connect();
        const db = client.db(db_name);
        const collection = db.collection(collection_name);
        data = await collection.find({}).toArray();
        logger.info(`Fetched ${data.length} documents`)
    } catch (err: any) {
        logger.error(`General error: ${err.message}, ${err}`);
        logger.error(`password provided is ${process.env.DB_PASSWORD}`)
        logger.error(`URI is ${URI}`)
    } finally {
        await client.close();
    }

    return data
}   
