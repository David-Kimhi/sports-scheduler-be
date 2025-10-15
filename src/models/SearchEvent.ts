import { Schema, model } from "mongoose";
import { getMongooseConnection } from "../services/index.js";
import { ANALYTICS_DB, API_MODULE } from "../config/index.js";

const SearchEventSchema = new Schema({
  ts: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // auto-delete after 30 days
  query: { type: String, trim: true },
  // either filters[] or filtersByType, your choice:
  filters: [{ type: { type: String }, id: String, label: String }],
  // geo enrichment (from client or IP lookup)
  city: String,
  country: String,
  countryCode: String,
  region: String,
  postcode: Schema.Types.Mixed,
  loc: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" } // [lng, lat]
  },
  numOfRecords: { type: Number },
  elapsedMs: { type: Number },
  
  // server-enriched
  ip: String,
  ua: String,
  sessionId: String,
  userId: Schema.Types.ObjectId,
  stage: { type: String, enum: ["submit", "typeahead"], required: true }
  
});

const analyticsConn = await getMongooseConnection(ANALYTICS_DB, API_MODULE);
export const SearchEvent = analyticsConn.model("SearchEvent", SearchEventSchema);
