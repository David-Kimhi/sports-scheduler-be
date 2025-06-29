import { Collection, type Document, Binary, ObjectId } from 'mongodb';
import { BaseModel } from '../../db/BaseModel.js';
import { type BaseDocument } from '../../db/BaseDocument.js';

export interface CountryData extends BaseDocument {
  flagImage: Binary; 
  flagContentType: string;
}

export class Country extends BaseModel {
    static collection: Collection<Document>;
  
    // Default game object 
    static default(): CountryData {
        return {
            ...this.defaultFields(),
            flagImage: new Binary(),
            flagContentType: ''
        };
    }


    static async findByName(name: string): Promise<Country[]> {
        const regex = new RegExp(name, 'i');

        const docs = await Country.collection.find({'name': regex}).toArray();

    
        return docs.map(doc => ({
            _id: doc._id,
            name: doc.name,
            code: doc.code,
            flagImage: doc.flagImage,
            flagContentType: doc.flagContentType
        }));
    }
}
