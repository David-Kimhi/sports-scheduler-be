import express from "express";
import { SearchEvent } from "../models/SearchEvent.js";

const router = express.Router();

router.post("/", express.json(), async (req, res) => {
  try {
    const hxff = (req.headers["x-forwarded-for"] as string) || "";
    const ip = hxff.split(",")[0].trim() || req.socket.remoteAddress || undefined;

    const ua = req.headers["user-agent"] as string | undefined;

    const payload = req.body ?? {};
    const doc = {
      ts: payload.ts ? new Date(payload.ts) : undefined,
      query: payload.query,
      filters: payload.filters,
      stage: payload.stage,
      city: payload.clientLoc?.city,
      country: payload.clientLoc?.country,
      countryCode: payload.clientLoc?.countryCode,
      region: payload.clientLoc?.region,
      postcode: payload.clientLoc?.postcode,
      loc: payload.clientLoc?.geo, // { type:'Point', coordinates:[lng,lat] }
      numOfRecords: payload.numOfRecords,
      elapsedMs: payload.elapsedMS,
      ip,
      ua,
      sessionId: payload.sessionId,
      userId: payload.userId
    };

    await SearchEvent.create(doc);
    res.status(204).end(); // no content
  } catch (e) {
    // don’t fail the page because of analytics
    res.status(200).json({ ok: true }); // or 202
  }
});

export default router;
