import { Collection, ObjectId, type Document } from 'mongodb';
import { getMongoDb } from '../mongodb/helpers.js';

export interface GameData {
  _id?: ObjectId;
  gameId: number;
  name: string;
  date: string;
  league: string;
  country: string;
  home: string;
  away: string;
  [key: string]: any;
}

export class Game {
    static collection: Collection<Document>;

    // Initialize the collection when Mongo is ready
    static async init(sport: string, collectionName: string) {
        const db = await getMongoDb(sport);
        Game.collection = db.collection<Document>(collectionName);
    }

    // Default game object (e.g., for creating new records)
    static default(): GameData {
        return {
            _id: new ObjectId(),
            gameId: -1,
            name: '',
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
            gameId: doc.fixture.id,
            name: `${doc.teams.home.name} vs ${doc.teams.away.name}`,
            date: doc.fixture.date,
            league: doc.league.name,
            country: doc.league.country,
            home: doc.teams.home.name,
            away: doc.teams.away.name,
        }));
    }
}
