import { Collection, type Document } from 'mongodb';
import type { BaseDocument, QueryParams } from './BaseInterfaces.js';
import { BaseModel } from './BaseModel.js';
import { API_MODULE, SMALL_L } from '../config/api.js';

export interface LeagueData extends BaseDocument {
  country: string;
  type: string;
  logo: string;
}

export class League extends BaseModel {
    static collection: Collection<Document>;


    static async init(dbName: string, collectionName: string, appName = API_MODULE) {
        League.collection = await this.initCollection(dbName, collectionName, appName);
    }

    static leagueDocMap: Record<keyof LeagueData, string> = {
        _id: '_id',
        id: 'league.id',
        injestion_info: 'injestion_info',
        name: 'league.name',
        country: 'country.name',
        type: 'league.type',
        logo: 'league.logo',
        teams: 'seasons.teams'
    };
    
    // Default game object (e.g., for creating new records)
    static default(): LeagueData {
        return {
            ...this.defaultFields(),
            country: '',
            type: '',
            logo: '',
        };
    }


    static async fetchAll() {
        if (!this.collection) {
            throw new Error(`Collection not initialized for ${this.name}`);
          }
  
          const docs = await this.collection.find().toArray()
          return docs.map(doc => this.mapDoc(doc, this.leagueDocMap))
    }

    static async fetchByWord(
        {word, filters = {}, field = 'name', limit = SMALL_L}: QueryParams & { field?: keyof LeagueData }
    ): Promise<LeagueData[]> {
        const regex = new RegExp(word, 'i');

        const dbField = this.leagueDocMap[field];
        const fieldFilter = { [dbField]: regex };

        let filtersQuery: Record<string, any> = {};
        if (filters.leagueIds?.length) {
            filtersQuery[this.leagueDocMap['id']] = { $in: filters.leagueIds };
        }
        if (filters.countryIds?.length) {
            filtersQuery[this.leagueDocMap['country']] = { $in: filters.countryIds };
        }
        if (filters.teamIds?.length) {
            filtersQuery[`${this.leagueDocMap['teams']}.id`] = { $in: filters.teamIds }
        }


        const conditions = [fieldFilter, filtersQuery]
            .filter(f => Object.keys(f).length > 0);

            const fullFilter = conditions.length > 0 ? { $and: conditions } : {};


        const docs = await League.collection.find(fullFilter).limit(limit).toArray();

        return docs.map(doc => this.mapDoc(doc, this.leagueDocMap));
    }
}
