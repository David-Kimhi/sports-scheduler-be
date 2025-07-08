import { ObjectId } from 'mongodb';

export interface BaseDocument {
  _id: ObjectId;
  id: number;
  name: string;
  injestion_info: { [key: string] : any }
  [key: string]: any; 
}