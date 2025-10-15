import type { Db } from "mongodb";
import { DAILY_FILTERS_COL, DAILY_PERF_COL, SEARCH_EVENTS_COL } from "../../config/index.js"



export async function rullupDay(dayStart: Date, dayEnd: Date, analyticsDb: Db, eventsCol: string = SEARCH_EVENTS_COL) {
    const collection = await analyticsDb.collection(eventsCol)

    await collection.aggregate([
      { $match: { ts: { $gte: dayStart, $lt: dayEnd } } },
      { $addFields: {
          country: { $ifNull: ["$country", null] },
          city:    { $ifNull: ["$city", null] }
      }},
      {
        $facet: {
          totals: [
            { $group: {
              _id: { country: "$country", city: "$city" },
              searches: { $sum: 1 },
              totalMs:  { $sum: { $ifNull: ["$elapsedMs", 0] } },
              totalRecs:{ $sum: { $ifNull: ["$numOfRecords", 0] } }
            } }
          ],
          distinct_ips: [
            { $group: { _id: { country: "$country", city: "$city", ip: "$ip" } } },
            { $group: { _id: { country: "$_id.country", city: "$_id.city" }, distinctIps: { $sum: 1 } } }
          ]
        }
      },
      { $project: {
          rows: {
            $map: {
              input: "$totals",
              as: "t",
              in: {
                country: "$$t._id.country",
                city:    "$$t._id.city",
                searches: "$$t.searches",
                totalMs:  "$$t.totalMs",
                totalRecs:"$$t.totalRecs",
                distinctIps: {
                  $let: {
                    vars: {
                      m: { $first: {
                        $filter: {
                          input: "$distinct_ips",
                          as: "d",
                          cond: { $and: [
                            { $eq: ["$$d._id.country", "$$t._id.country"] },
                            { $eq: ["$$d._id.city",    "$$t._id.city"] }
                          ] }
                        }
                      } }
                    },
                    in: { $ifNull: ["$$m.distinctIps", 0] }
                  }
                }
              }
            }
          }
      } },
      { $unwind: "$rows" },

      // Build safe composite _id (strings only; substitute for nulls)
      { $set: {
          date: dayStart,
          _id: {
            $concat: [
              { $toString: dayStart }, "::",
              { $ifNull: ["$rows.country", "<NULL>"] }, "::",
              { $ifNull: ["$rows.city",    "<NULL>"] }
            ]
          },
          country: "$rows.country",
          city:    "$rows.city",
          searches: "$rows.searches",
          distinctIps: "$rows.distinctIps",
          avgFetchTimeMs: {
            $cond: [{ $gt: ["$rows.searches", 0] }, { $divide: ["$rows.totalMs", "$rows.searches"] }, 0]
          },
          avgRecordsReturned: {
            $cond: [{ $gt: ["$rows.searches", 0] }, { $divide: ["$rows.totalRecs", "$rows.searches"] }, 0]
          }
      } },

      { $project: {
          _id: 1, date: 1, country: 1, city: 1,
          searches: 1, distinctIps: 1,
          avgFetchTimeMs: 1, avgRecordsReturned: 1
      }},

      { $merge: {
          into: "search_daily_perf",
          on: "_id",
          whenMatched: "replace",
          whenNotMatched: "insert"
      } }
    ]).toArray();
    
    
    await collection.aggregate([
      { $match: { ts: { $gte: dayStart, $lt: dayEnd } } },
      { $addFields: {
          country: { $ifNull: ["$country", null] },
          city:    { $ifNull: ["$city", null] }
      }},
      { $unwind: "$filters" },
      { $addFields: {
          filterType: "$filters.type",
          filterId:   { $toString: "$filters.id" },  // normalize type
          filterLabel:"$filters.label"
      }},
      { $group: {
          _id: {
            country: "$country", city: "$city",
            filterType: "$filterType", filterId: "$filterId", filterLabel: "$filterLabel"
          },
          searches: { $sum: 1 },
          totalMs:  { $sum: { $ifNull: ["$elapsedMs", 0] } },
          totalRecs:{ $sum: { $ifNull: ["$numOfRecords", 0] } }
      }},
    
      // distinct IPs per (loc, filter)
      { $lookup: {
          from: eventsCol,
          let: { country: "$_id.country", city: "$_id.city", fType: "$_id.filterType", fId: "$_id.filterId" },
          pipeline: [
            { $match: { ts: { $gte: dayStart, $lt: dayEnd } } },
            { $addFields: { country: { $ifNull: ["$country", null] }, city: { $ifNull: ["$city", null] } } },
            { $unwind: "$filters" },
            { $addFields: { fType: "$filters.type", fId: { $toString: "$filters.id" } } },
            { $match: { $expr: { $and: [
              { $eq: ["$country", "$$country"] },
              { $eq: ["$city",    "$$city"] },
              { $eq: ["$fType",   "$$fType"] },
              { $eq: ["$fId",     "$$fId"] }
            ] } } },
            { $group: { _id: { ip: "$ip" } } },
            { $count: "distinctIps" }
          ],
          as: "ipStats"
      }},
    
      { $set: {
          date: dayStart,
          // safe composite key for merge
          _id: {
            $concat: [
              { $toString: dayStart }, "::",
              { $ifNull: ["$_id.country", "<NULL>"] }, "::",
              { $ifNull: ["$_id.city",    "<NULL>"] }, "::",
              "$_id.filterType", "::",
              "$_id.filterId"
            ]
          },
          country:     "$_id.country",
          city:        "$_id.city",
          filterType:  "$_id.filterType",
          filterId:    "$_id.filterId",
          filterLabel: "$_id.filterLabel",
          searches:    "$searches",
          distinctIps: { $ifNull: [{ $first: "$ipStats.distinctIps" }, 0] },
          avgFetchTimeMs: {
            $cond: [{ $gt: ["$searches", 0] }, { $divide: ["$totalMs", "$searches"] }, 0]
          },
          avgRecordsReturned: {
            $cond: [{ $gt: ["$searches", 0] }, { $divide: ["$totalRecs", "$searches"] }, 0]
          }
      }},
    
      { $project: {
          _id: 1, date: 1, country: 1, city: 1,
          filterType: 1, filterId: 1, filterLabel: 1,
          searches: 1, distinctIps: 1,
          avgFetchTimeMs: 1, avgRecordsReturned: 1
      }},
    
      { $merge: {
          into: "search_daily_filters",
          on: "_id",
          whenMatched: "replace",
          whenNotMatched: "insert"
      } }
    ]).toArray();
      
      
}
