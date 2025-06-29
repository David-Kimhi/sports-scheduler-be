import { Collection, ObjectId, type Document } from 'mongodb';
import type { BaseDocument } from '../../db/BaseDocument.js';
import { BaseModel } from '../../db/BaseModel.js';

export interface LeagueData extends BaseDocument {
  country: string;
  type: string;
  logo: string;
}

export class League extends BaseModel {
    static collection: Collection<Document>;

    // Default game object (e.g., for creating new records)
    static default(): LeagueData {
        return {
            ...this.defaultFields(),
            country: '',
            type: '',
            logo: '',
        };
    }


    static async findByName(name: string): Promise<LeagueData[]> {
        const regex = new RegExp(name, 'i');

        const docs = await League.collection.find({'league.name': regex}).toArray();

    
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
