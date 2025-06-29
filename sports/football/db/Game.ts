import { Collection, ObjectId, type Document } from 'mongodb';
import type { BaseDocument } from '../../db/BaseDocument.js';
import { BaseModel } from '../../db/BaseModel.js';

export interface GameData extends BaseDocument {
  date: string;
  league: string;
  country: string;
  home: string;
  away: string;
}

export class Game extends BaseModel {
    static collection: Collection<Document>;

    // Default game object (e.g., for creating new records)
    static default(): GameData {
        return {
            ...this.defaultFields(),
            date: '',
            league: '',
            country: '',
            home: '',
            away: '',
        };
    }


    static async findByName(name: string): Promise<GameData[]> {
        const regex = new RegExp(name, 'i');

        const docs = await Game.collection.find({
        $or: [
            { 'teams.home.name': regex },
            { 'teams.away.name': regex }
        ]
        }).toArray();

    
        return docs.map(doc => ({
            _id: doc._id,
            id: doc.fixture.id,
            name: `${doc.teams.home.name} vs ${doc.teams.away.name}`,
            injestion_info: doc.injestion_info,
            date: doc.fixture.date,
            league: doc.league.name,
            country: doc.league.country,
            home: doc.teams.home.name,
            away: doc.teams.away.name,
        }));
    }
}
