import { Collection, type Document } from 'mongodb';
import type { BaseDocument, QueryParams } from './BaseInterfaces.js';
import { BaseModel } from './BaseModel.js';
import { API_MODULE, SMALL_L } from '../config/index.js';

export interface GameData extends BaseDocument {
  date: string;
  league: string;
  country: string;
  home: string;
  away: string;
}

export class Game extends BaseModel {
    static collection: Collection<Document>;

    static async init(dbName: string, collectionName: string, appName = API_MODULE) {
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


    static async fetchByWord({
        word, after, field, sort = 'date', direction = 'desc', limit = SMALL_L, from, to
    }: QueryParams
    ): Promise<GameData[]> {
        const regex = new RegExp(word, 'i');

        // build filter for the field
        const dbField = this.gameDocMap[field];
        let fieldFilter;
        if (field === 'name') {
            fieldFilter = {
                $or: [
                  { [this.gameDocMap.home as string]: regex },
                  { [this.gameDocMap.away as string]: regex }
                ]
              };
        } else if (typeof dbField === 'string') {
            // Now TypeScript knows it's a string here
            fieldFilter = { [dbField]: regex };
        } else {
            // This would only run if someone used a computed field (function),
            // but since you "handled" those in the `if`, this is just a safeguard.
            throw new Error(`Field ${field} does not map to a string field`);
        }
        
        // Pagination (optional)
        let paginationFilter: Record<string, any> = {};
        if (after) {
            paginationFilter = { [this.gameDocMap[sort] as string]: { [direction === 'asc' ? '$gt' : '$lt']: after } }
        }

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
            $and: [fieldFilter, paginationFilter, dateFilter]
        };

        const docs = await Game.collection.find(fullFilter)
            .sort({ [this.gameDocMap[sort] as string]: direction === 'asc' ? 1 : -1 })
            .limit(limit)
            .toArray();
    
        return docs.map(doc => this.mapDoc<GameData>(doc, this.gameDocMap));
    }
}
