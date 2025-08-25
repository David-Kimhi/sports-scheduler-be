import type { Db } from 'mongodb';
import type { EntityType } from "../interfaces.ts/models.interface.js";
import { fetchPopularityMap, popularityKey } from '../models/SearchPopularity.js';
import { COUNTRIES_COLL_NAME } from '../config/mongo.config.js';

type IdSelector<T> = (item: T) => string | number;

// Default id selectors per entity type
const defaultIdSelector = <T extends Record<string, any>>(type: EntityType): IdSelector<T> => {
  if (type === COUNTRIES_COLL_NAME) return (item) => item.name; // country uses "name"
  return (item) => item.id;                           // team/league use "id"
};

interface SortByPopularityOpts<T> {
  idSelector?: IdSelector<T>;
  /** Optional tiebreaker selector (e.g., name) */
  tieBreaker?: (a: T, b: T) => number;
}

/**
 * Sort a fetched documents array by popularity, DESC.
 * Reads counts from `search_popularity` and sorts in memory.
 */
export async function sortByPopularityInMemory<T extends Record<string, any>>(
  db: Db,
  type: EntityType,
  items: T[],
  opts: SortByPopularityOpts<T> = {}
): Promise<T[]> {
  if (items.length === 0) return items;

  const getId = opts.idSelector ?? defaultIdSelector<T>(type);
  const ids = items.map(getId);

  // Build key -> count map
  const popMap = await fetchPopularityMap(db, type, ids);

  // Attach counts and sort
  return [...items].sort((a, b) => {
    const aid = getId(a);
    const bid = getId(b);
    const ac = popMap[popularityKey(type, aid)] ?? 0;
    const bc = popMap[popularityKey(type, bid)] ?? 0;
    if (bc !== ac) return bc - ac; // desc by popularity
    // Optional tiebreaker
    if (opts.tieBreaker) return opts.tieBreaker(a, b);
    return 0;
  });
}
