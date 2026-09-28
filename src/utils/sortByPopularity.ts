import type { Db } from 'mongodb';
import type { EntityType } from '../interfaces/models.interface.js';
import { fetchPopularityMap, popularityKey } from '../models/SearchPopularity.js';
import { COUNTRIES_COLL_NAME } from '../config/footballDb.js';

type IdSelector<T> = (item: T) => string | number;

const defaultIdSelector = <T extends Record<string, any>>(type: EntityType): IdSelector<T> => {
  if (type === COUNTRIES_COLL_NAME) return (item) => item.name;
  return (item) => item.id;
};

interface SortByPopularityOpts<T> {
  idSelector?: IdSelector<T>;
  tieBreaker?: (a: T, b: T) => number;
}

export async function sortByPopularityInMemory<T extends Record<string, any>>(
  db: Db,
  type: EntityType,
  items: T[],
  opts: SortByPopularityOpts<T> = {}
): Promise<T[]> {
  if (items.length === 0) return items;

  const getId = opts.idSelector ?? defaultIdSelector<T>(type);
  const ids = items.map(getId);

  const popMap = await fetchPopularityMap(db, type, ids);

  return [...items].sort((a, b) => {
    const aid = getId(a);
    const bid = getId(b);
    const ac = popMap[popularityKey(type, aid)] ?? 0;
    const bc = popMap[popularityKey(type, bid)] ?? 0;
    if (bc !== ac) return bc - ac;
    if (opts.tieBreaker) return opts.tieBreaker(a, b);
    return 0;
  });
}
