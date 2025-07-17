import { Collection, type Document } from 'mongodb';
import type { BaseDocument, QueryParams } from './BaseInterfaces.js';
import { BaseModel } from './BaseModel.js';
import { SMALL_L } from '../config/api.js';

export interface LeagueData extends BaseDocument {
  country: string;
  type: string;
  logo: string;
}

export class League extends BaseModel {
    static collection: Collection<Document>;


    static async init(dbName: string, collectionName: string, appName = 'api') {
        League.collection = await this.initCollection(dbName, collectionName, appName);
    }
    
    // Default game object (e.g., for creating new records)
    static default(): LeagueData {
        return {
            ...this.defaultFields(),
            country: '',
            type: '',
            logo: '',
        };
    }

    static async getByName(
        {name, limit = SMALL_L}: QueryParams
    ): Promise<LeagueData[]> {
        const regex = new RegExp(name, 'i');

        const docs = await League.collection.find({'league.name': regex}).limit(limit).toArray();

    
        return docs.map(doc => ({
            _id: doc._id,
            id: doc.league.id,
            name: doc.league.name,
            injestion_info: doc.injestion_info,
            country: doc.country.name,
            type: doc.league.type,
            logo: doc.league.logo
        }));
    }
}
