// Team.ts
import { Collection, type Document, Binary } from 'mongodb';
import { BaseModel } from './BaseModel.js';
import { type BaseDocument, type QueryParams } from './BaseInterfaces.js';
import { API_MODULE, SMALL_L } from '../config/index.js';

export interface TeamData extends BaseDocument {
  code: string,
  logo: string,
  season: number,
  league: number
}

export class Team extends BaseModel {
    static collection: Collection<Document>;

    static async init(dbName: string, collectionName: string, appName = API_MODULE) {
        Team.collection = await this.initCollection(dbName, collectionName, appName);
    }


    static teamDocMap: Record<keyof TeamData, string> = {
        _id: '_id',
        id: 'team.id',
        name: 'team.name',
        injestion_info: 'injestion_info',
        country: 'team.country',
        code: 'team.code',
        logo: 'team.logo',
        season: 'team.season',
        league: 'team.league'
    };
  
    // Default game object 
    static default(): TeamData {
        return {
            ...this.defaultFields(),
            code: '',
            logo: '',
            season: 0,
            league: 0
        };
    }

    public static async fetchAll(field = 'season', word: any = 2023) {
        if (!this.collection) {
          throw new Error(`Collection not initialized for ${this.name}`);
        }

        const dbField = this.teamDocMap[field];
        const docs = await this.collection.find({[dbField]: word }).toArray()
        return docs.map(doc => this.mapDoc(doc, this.teamDocMap))
    }

    public static async fetchLogos() {
        if (!this.collection) {
          throw new Error(`Collection not initialized for ${this.name}`);
        }
      
        const pipeline = [
          {
            $sort: {
              'team.id': 1,
              'injestion_info.fetched_at': -1 // Assuming it's ISO date string
            }
          },
          {
            $group: {
              _id: '$team.id',
              logo: { $first: '$team.logo' }
            }
          },
          {
            $project: {
              _id: 0,
              id: '$_id',
              logo: 1
            }
          }
        ];
      
        const docs = await this.collection.aggregate(pipeline).toArray();
        return docs;
    }
      
      


    static async fetchByWord(
        {word, filters = {}, field = 'name', limit=SMALL_L}: QueryParams & { field?: keyof TeamData }
    ): Promise<TeamData[]> {
        const regex = new RegExp(word, 'i');

        const dbField = this.teamDocMap[field];
        const fieldFilter = { [dbField]: regex };

        let filtersQuery: Record<string, any> = {};
        if (filters.teamIds?.length) {
            filtersQuery[this.teamDocMap['id']] = { $in: filters.teamIds };
        }
        if (filters.leagueIds?.length) {
            filtersQuery[this.teamDocMap['league']] = { $in: filters.leagueIds };
        }
        if (filters.countryIds?.length) {
            filtersQuery[this.teamDocMap['country']] = { $in: filters.countryIds };
        }

        const conditions = [fieldFilter, filtersQuery]
            .filter(f => Object.keys(f).length > 0);

        const fullFilter = conditions.length > 0 ? { $and: conditions } : {};


        const docs = await Team.collection.find(fullFilter).limit(limit).toArray();

        const teams = docs.map(doc => this.mapDoc<TeamData>(doc, this.teamDocMap));

        // Deduplicate by `id` (for now, fetch all team existed, from all seasons)
        const seen = new Set<number>();
        const uniqueTeams = teams.filter(team => {
            if (seen.has(team.id)) return false;
            seen.add(team.id);
            return true;
        });

        return uniqueTeams;
    }
}
