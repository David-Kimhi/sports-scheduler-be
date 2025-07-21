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


    static async fetchByWord(
        {word, field = 'name', limit=SMALL_L}: QueryParams & { field?: keyof TeamData }
    ): Promise<Team[]> {
        const regex = new RegExp(word, 'i');

        const dbField = this.teamDocMap[field];

        const docs = await Team.collection.find({[dbField]: regex}).limit(limit).toArray();

        return docs.map(doc => this.mapDoc(doc, this.teamDocMap));
    }


}
