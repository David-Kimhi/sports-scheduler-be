import { Collection, ObjectId, type Document } from "mongodb";
import { getMongoDb } from "../../mongodb/helpers.js";
import type { BaseDocument } from "./BaseDocument.js";

export class BaseModel {

    static async initCollection(
      dbName: string,
      collectionName: string,
      appName: string = 'api'
    ): Promise<Collection<Document>> {
      const db = await getMongoDb(dbName, appName);
      return db.collection<Document>(collectionName);
    }

      // Shared metadata fields
    static defaultFields(): BaseDocument {
        return {
            _id: new ObjectId(),
            id: -1,
            name: '',
            injestion_info: {},         
        };
    } 

  }
  