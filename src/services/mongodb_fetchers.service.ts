import { MongoClient, type Document, type WithId} from 'mongodb';
import { createLogger } from './logger.service.js';
import { uriMap, type Sport } from '../utils/constants.utils.js';

export async function fetchCollection(db_name: Sport, collection_name: string) {

    const logger = createLogger('MongoDB', db_name)

    const client = new MongoClient(uriMap[db_name]);

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
        logger.error(`URI is ${uriMap[db_name]}`)
    } finally {
        await client.close();
    }

    return data
}   
