import { ObjectId, Collection} from 'mongodb';

export interface BaseDocument {
  _id: ObjectId;
  id: number;
  name: string;
  injestion_info: { [key: string] : any }
  [key: string]: any; 
};

export interface QueryParams {
  name: string;
  after?: Date;
  from?: Date;
  to?: Date;
  sort?: string;
  direction?: 'asc' | 'desc';
  limit?: number;
}

export interface StaticModel {
  collection: Collection<Document>;
  mapDoc<T>(doc: Document, map: Record<string, string>): T;
}
