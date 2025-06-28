import { Collection, ObjectId, type Document, Binary } from 'mongodb';
import { getMongoDb } from '../mongodb/helpers.js';

export interface CountryData {
  _id: ObjectId;
  name: string;
  flagImage: Binary; 
  flagContentType: string;
  [key: string]: any;
}

export class Country {
    static collection: Collection<Document>;

    // Initialize the collection when Mongo is ready
    static async init(sport: string, collectionName: string) {
        const db = await getMongoDb(sport);
        Country.collection = db.collection<Document>(collectionName);
    }

    // Default game object (e.g., for creating new records)
    static default(): CountryData {
        return {
            _id: new ObjectId(),
            name: '',
            code: '',
            flagImage: new Binary(),
            flagContentType: '',
        };
    }


    static async findByName(name: string): Promise<Country[]> {
        const regex = new RegExp(name, 'i');

        const docs = await Country.collection.find({'name': regex}).toArray();

    
        return docs.map(doc => ({
            _id: doc._id,
            name: doc.name,
            code: doc.code,
            flagImage: doc.flagImage,
            flagContentType: doc.flagContentType
        }));
    }
}
