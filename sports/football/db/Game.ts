import { Collection, ObjectId, type Document } from 'mongodb';
import type { BaseDocument } from '../../db/BaseDocument.js';
import { BaseModel } from '../../db/BaseModel.js';
import { SMALL_L } from '../api/config.js';

export interface GameData extends BaseDocument {
  date: string;
  league: string;
  country: string;
  home: string;
  away: string;
}

export class Game extends BaseModel {
    static collection: Collection<Document>;

    static async init(dbName: string, collectionName: string, appName = 'api') {
        Game.collection = await this.initCollection(dbName, collectionName, appName);
    }

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


    static async findByName(
        name: string
        , after: Date
        , sort: string = 'fixture.date'
        , direction: string = 'desc'
        , limit: number = SMALL_L
        , from?: Date
        , to?: Date
    ): Promise<GameData[]> {
        const regex = new RegExp(name, 'i');

        // name filter
        const nameFilter = {
            $or: [
              { 'teams.home.name': regex },
              { 'teams.away.name': regex }
            ]
          };
        
        // Pagination (optional)
        const paginationFilter = after
            ? { [sort]: { [direction === 'asc' ? '$gt' : '$lt']: after } }
            : {};

        // Date-Range filter 
        let dateFilter: Record<string, any> = {};

        if (from) {
            dateFilter.$gte = from;
        }
        if (to) {
            dateFilter.$lte = to;
        }
        
        dateFilter = Object.keys(dateFilter).length > 0
            ? { date: dateFilter }
            : {};
    
        const fullFilter = {
        $and: [nameFilter, paginationFilter, dateFilter]
        };

        const docs = await Game.collection.find(fullFilter)
            .sort({ [sort]: direction === 'asc' ? 1 : -1 })
            .limit(limit)
            .toArray();
    
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
