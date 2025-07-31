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
        league_id: 'league.id',
        country: 'league.country',
        home: 'teams.home.name',
        home_id: 'teams.home.id',
        away: 'teams.away.name',
        away_id: 'teams.away.id',
        round: 'league.round',
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
        word,
        filters = {},
        after,
        field,
        sort = 'date',
        direction = 'asc',
        limit = SMALL_L,
        from,
        to
      }: QueryParams): Promise<GameData[]> {
        // Default `from` to the current moment if not provided
        if (!from) {
          from = new Date();
        }
    
        // build filter for the field
        const dbField = this.gameDocMap[field];
        let fieldFilter: Record<string, any> = {};

        if (word && word.trim() !== '') {
            const regex = new RegExp(word, 'i');
            if (field === 'name') {
                fieldFilter = {
                    $or: [
                        { [this.gameDocMap.home as string]: regex },
                        { [this.gameDocMap.away as string]: regex }
                    ]
                };
            } else if (typeof dbField === 'string') {
                fieldFilter = { [dbField]: regex };
            } else {
                throw new Error(`Field ${field} does not map to a string field`);
            }
        }

    
        // Pagination filter
        let paginationFilter: Record<string, any> = {};
        if (after) {
            paginationFilter = { [this.gameDocMap[sort] as string]: { [direction === 'asc' ? '$gt' : '$lt']: after } };
        }
    
        // Date-Range filter
        let dateFilter: Record<string, any> = {};
        if (from) dateFilter.$gte = from;
        if (to) dateFilter.$lte = to;
        dateFilter = Object.keys(dateFilter).length > 0 ? { [this.gameDocMap['date'] as string]: dateFilter } : {};
    
        // Build filters from country, league, team
        let filtersQuery: Record<string, any> = {};
        const countryField = this.gameDocMap['country'] as string;
        const leagueField = this.gameDocMap['league_id'] as string;
        const homeTeamField = this.gameDocMap['home_id'] as string;
        const awayTeamField = this.gameDocMap['away_id'] as string;

        if (filters.countryIds?.length) {
            filtersQuery[countryField] = { $in: filters.countryIds };
        }
        if (filters.leagueIds?.length) {
            filtersQuery[leagueField] = { $in: filters.leagueIds };
        }
        if (filters.teamIds?.length) {
            filtersQuery.$or = [
                { [homeTeamField]: { $in: filters.teamIds } },
                { [awayTeamField]: { $in: filters.teamIds } }
            ];
        }
    
        // Combine all filters
        const conditions = [fieldFilter, paginationFilter, dateFilter, filtersQuery]
            .filter(f => Object.keys(f).length > 0);

        const fullFilter = conditions.length > 0 ? { $and: conditions } : {};

    
        const docs = await Game.collection.find(fullFilter)
            .sort({ [this.gameDocMap[sort] as string]: direction === 'asc' ? 1 : -1 })
            .limit(limit)
            .toArray();
    
        return docs.map(doc => this.mapDoc<GameData>(doc, this.gameDocMap));
    }
}