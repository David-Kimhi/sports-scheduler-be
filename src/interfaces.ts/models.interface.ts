import { ObjectId, Collection} from 'mongodb';
import { TEAMS_COLL_NAME, LEAGUES_COLL_NAME, COUNTRIES_COLL_NAME } from '../config/index.js';

export type EntityType = typeof TEAMS_COLL_NAME | typeof LEAGUES_COLL_NAME | typeof COUNTRIES_COLL_NAME;


export interface BaseDocument {
  _id: ObjectId;
  id: number;
  name: string;
  injestion_info: { [key: string] : any }
  [key: string]: any; 
};

export interface SearchPopularity {
  _id: string;            
  type: EntityType
  entityId: string;       
  count: number;          
  updatedAt: Date;
}

export interface QueryParams {
  word: string;
  field: string;
  filters?: {
    countryIds?: string[];
    leagueIds?: string[];
    teamIds?: string[];
  };
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
