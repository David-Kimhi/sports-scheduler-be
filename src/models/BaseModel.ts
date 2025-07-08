import { Collection, ObjectId, type Document } from "mongodb";
import { getMongoDb } from "../services/mongodb_conn.service.js";
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
      
    protected static getNestedValue(obj: any, path: string): any {
      return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }

    protected static mapDoc<T>(
      doc: any,
      sourceMap: Record<keyof T, string | ((doc: any) => any)>
    ): T {
      const result: Partial<T> = {};

      for (const [key, val] of Object.entries(sourceMap)) {
        (result as any)[key] =
          typeof val === 'function' ? val(doc) : this.getNestedValue(doc, val as string);
      }

      return result as T;
    }
}
