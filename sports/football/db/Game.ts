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

    static gameDocMap: Record<keyof GameData, string | ((doc: any) => any)> = {
        _id: '_id',
        id: 'fixture.id',
        injestion_info: 'injestion_info',
        date: 'fixture.date',
        league: 'league.name',
        country: 'league.country',
        home: 'teams.home.name',
        away: 'teams.away.name',
        name: (doc: any) => `${doc.teams.home.name} vs ${doc.teams.away.name}`
    };

    static dateFields = ['date', 'name']
        .map((field) => Game.gameDocMap[field])
        .filter((v): v is string => typeof v === 'string'); // ensure it's string and not function


    // Default game object 
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


    static async getGames(
        name: string
        , after: Date
        , sort: string
        , direction: string
        , limit: number = SMALL_L
        , from?: Date
        , to?: Date
    ): Promise<GameData[]> {
        const regex = new RegExp(name, 'i');

        // name filter
        const nameFilter = {
            $or: [
              { [this.gameDocMap.home as string]: regex },
              { [this.gameDocMap.away as string]: regex }
            ]
          };
        
        // Pagination (optional)
        const paginationFilter = after
            ? { [this.gameDocMap[sort] as string]: { [direction === 'asc' ? '$gt' : '$lt']: after } }
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
            .sort({ [this.gameDocMap[sort] as string]: direction === 'asc' ? 1 : -1 })
            .limit(limit)
            .toArray();
    
        return docs.map(doc => this.mapDoc<GameData>(doc, this.gameDocMap));;
    }
}
