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
        {word, field = 'name', limit=SMALL_L}: QueryParams & { field?: keyof CountryData }
    ): Promise<Country[]> {
        const regex = new RegExp(word, 'i');

        const dbField = this.countryDocMap[field];

        const docs = await Country.collection.find({[dbField]: regex}).limit(limit).toArray();

        return docs.map(doc => this.mapDoc(doc, this.countryDocMap));
    }


}
