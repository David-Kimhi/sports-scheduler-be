import { ObjectId, type Db, type Collection} from "mongodb";
import type { EntityType, SearchPopularity } from "../interfaces.ts/models.interface.js";

const POP_COLLECTION = 'search_popularity';


export const popCol = (db: Db): Collection<SearchPopularity> =>
    db.collection<SearchPopularity>(POP_COLLECTION);

export const popularityKey = (type: EntityType, id: string | number) =>
    `${type}:${String(id)}`;

export async function fetchPopularityMap(
    db: Db,
    type: EntityType,
    ids: Array<string | number>
  ): Promise<Record<string, number>> {
    if (!ids.length) return {};
    const keys = ids.map((id) => popularityKey(type, id));
    const rows = await popCol(db)
      .find({ _id: { $in: keys } }) // now _id is string, so keys: string[] is fine
      .project({ _id: 1, count: 1 })
      .toArray();
  
    const map: Record<string, number> = {};
    for (const r of rows) map[r._id] = r.count ?? 0;
    return map;
  }
  
  export async function incrementPopularity(
    db: Db,
    type: EntityType,
    id: string | number,
    incBy = 1
  ) {
    const _id = popularityKey(type, id);
    await popCol(db).updateOne(
      { _id },
      {
        $inc: { count: incBy }, // creates count if missing
        $set: { updatedAt: new Date(), type, entityId: String(id) },
        $setOnInsert: { createdAt: new Date() } // <-- no "count" here
      },
      { upsert: true }
    );
  }
  
  
