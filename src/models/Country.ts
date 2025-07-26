import { Collection, type Document, Binary } from 'mongodb';
import { BaseModel } from './BaseModel.js';
import { type BaseDocument, type QueryParams } from './BaseInterfaces.js';
import { API_MODULE, SMALL_L } from '../config/index.js';

export interface CountryData extends BaseDocument {
  code: string,
  flag: string
}

export class Country extends BaseModel {
    static collection: Collection<Document>;

    static async init(dbName: string, collectionName: string, appName = API_MODULE) {
        Country.collection = await this.initCollection(dbName, collectionName, appName);
    }


    static countryDocMap: Record<keyof CountryData, string> = {
        _id: '_id',
        name: 'name',
        injestion_info: 'injestion_info',
        code: 'code',
        flag: 'flag'
    };
  
    // Default game object 
    static default(): CountryData {
        return {
            ...this.defaultFields(),
            code: '',
            flag: ''
        };
    }

    public static async fetchAll() {
        if (!this.collection) {
          throw new Error(`Collection not initialized for ${this.name}`);
        }

        const docs = await this.collection.find().toArray()
        return docs.map(doc => this.mapDoc(doc, this.countryDocMap))
    }


    static async fetchByWord(
        {word, filters = {}, field = 'name', limit=SMALL_L}: QueryParams & { field?: keyof CountryData }
    ): Promise<CountryData[]> {

        // Lazy import to avoid circular reference. for team and league filters
        const { League } = await import('./League.js');
        const { Team } = await import('./Team.js');

        const regex = new RegExp(word, 'i');

        const dbField = this.countryDocMap[field];
        const fieldFilter = { [dbField]: regex };

        const countrySet = new Set<string>();

        // Add countries from countryIds (if provided), leagueIds and teamIds
        if (filters.countryIds?.length) {
            filters.countryIds.forEach(name => countrySet.add(name));
        }
        if (filters.leagueIds?.length) {
            const countryIdsFromLeagues = await League.collection.distinct(
                'country.name', 
                { 'league.id': { $in: filters.leagueIds } }
            );
            countryIdsFromLeagues.forEach(name => countrySet.add(name));
        }
        if (filters.teamIds?.length) {
            const countryIdsFromTeams = await Team.collection.distinct(
                'team.country', 
                { 'team.id': { $in: filters.teamIds } }
            );
            countryIdsFromTeams.forEach(name => countrySet.add(name));
        }

        const allCountryIds = Array.from(countrySet);

        // Build the filter if we have countries
        let countryIdsFilter: Record<string, any> = {};
        if (allCountryIds.length) {
            countryIdsFilter[this.countryDocMap['name']] = { $in: allCountryIds };
        }

        const conditions = [fieldFilter, countryIdsFilter]
            .filter(f => Object.keys(f).length > 0);

        const fullFilter = conditions.length > 0 ? { $and: conditions } : {};

        const docs = await Country.collection.find(fullFilter).limit(limit).toArray();

        return docs.map(doc => this.mapDoc(doc, this.countryDocMap));
    }


}
