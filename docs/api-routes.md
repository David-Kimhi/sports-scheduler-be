# Sports Scheduler API — Route Reference

Base URL (production): `https://sports-scheduler.com`  
Base URL (local): `http://localhost:3000`

All routes are prefixed with `/v1`.

---

## Migration: Old → New URLs

| Old URL | New URL | Notes |
|---|---|---|
| `GET /football/games` | `GET /v1/football/games` | Same params, `from` & `to` now work |
| `GET /football/leagues?word=x` | `GET /v1/football/leagues?word=x` | `word` is now optional |
| `GET /football/leagues/fetchAll` | `GET /v1/football/leagues` | Merged into one endpoint |
| `GET /football/leagues/fetchLogos` | `GET /v1/football/leagues/logos` | |
| `GET /football/teams/fetchAll` | `GET /v1/football/teams` | Optional `?season=` param |
| `GET /football/teams/fetchLogos` | `GET /v1/football/teams/logos` | |
| `GET /football/countries/fetchAll` | `GET /v1/football/countries` | |
| `GET /football/search` | `GET /v1/football/search` | Same params |
| `POST /analytics/searchEvent` | `POST /v1/analytics/events` | |

---

## Response Envelope

All successful responses are wrapped:
```json
{ "data": <payload> }
```

All error responses:
```json
{ "error": { "code": "ERROR_CODE", "message": "Human readable message" } }
```

Validation errors also include a `details` field:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Validation failed", "details": { ... } } }
```

---

## Health

### `GET /health`
Server liveness check. Not versioned.

**Response `200`:**
```json
{ "status": "ok", "time": "2026-05-02T12:00:00.000Z" }
```

---

## Football

### Games

#### `GET /v1/football/games`

List fixtures, optionally filtered and paginated.

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `word` | `string` | `""` | Filter by team name (home or away) |
| `field` | `string` | `"name"` | Field to match `word` against |
| `sort` | `"date" \| "name"` | `"date"` | Sort field |
| `direction` | `"asc" \| "desc"` | `"desc"` | Sort direction |
| `limit` | `number` | `20` | Max results (1–100) |
| `after` | `ISO date string` | now | Cursor: return records after this value |
| `from` | `ISO date string` | now | Date range start (inclusive) |
| `to` | `ISO date string` | — | Date range end (inclusive) |

**Response `200`:**
```json
{
  "data": [
    {
      "id": 12345,
      "name": "Arsenal vs Chelsea",
      "date": "2026-05-10T15:00:00.000Z",
      "league": "Premier League",
      "country": "England",
      "home": "Arsenal",
      "away": "Chelsea"
    }
  ]
}
```

---

### Leagues

#### `GET /v1/football/leagues`

List all leagues, or search by word.

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `word` | `string` | — | If provided, filters by regex match |
| `field` | `"name" \| "country"` | `"name"` | Field to match `word` against |
| `limit` | `number` | `20` | Max results (1–100). Only applies when `word` is provided |

**Response `200`:**
```json
{
  "data": [
    { "id": 39, "name": "Premier League", "country": "England", "type": "League", "logo": "https://..." }
  ]
}
```

#### `GET /v1/football/leagues/logos`

Fetch all unique league logos (latest per league id).

No query params.

**Response `200`:**
```json
{
  "data": [
    { "id": 39, "logo": "https://..." }
  ]
}
```

---

### Teams

#### `GET /v1/football/teams`

List all teams for a given season.

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `season` | `number` | `2023` | Season year to filter by |

**Response `200`:**
```json
{
  "data": [
    { "id": 42, "name": "Arsenal", "country": "England", "code": "ARS", "logo": "https://...", "season": 2023 }
  ]
}
```

#### `GET /v1/football/teams/logos`

Fetch all unique team logos (latest per team id).

No query params.

**Response `200`:**
```json
{
  "data": [
    { "id": 42, "logo": "https://..." }
  ]
}
```

---

### Countries

#### `GET /v1/football/countries`

Fetch all countries.

No query params.

**Response `200`:**
```json
{
  "data": [
    { "id": 1, "name": "England", "code": "GB", "flag": "https://..." }
  ]
}
```

---

### Unified Search

#### `GET /v1/football/search`

Search across teams, leagues, countries, and optionally games in a single request.

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `word` | `string` | `""` | Search term |
| `field` | `string` | `"name"` | Field to match against |
| `limit` | `number` | `20` | Max results per collection (1–100) |
| `country` | `string \| string[]` | — | Filter by country code(s) |
| `league` | `number \| number[]` | — | Filter by league id(s) |
| `team` | `number \| number[]` | — | Filter by team id(s) |
| `games` | `boolean` | `false` | Include games in results (also increments popularity counters) |

**Response `200`:**
```json
{
  "data": {
    "teams": [...],
    "leagues": [...],
    "countries": [...],
    "fixtures": []
  }
}
```

Results for teams, leagues, and countries are sorted by search popularity (descending).

---

## Analytics

### Search Events

#### `POST /v1/analytics/events`

Track a search event. Errors are silently swallowed — this call should never block the UI.

**Request body:**
```json
{
  "query": "Arsenal",
  "stage": "submit",
  "filters": [{ "type": "league", "id": "39", "label": "Premier League" }],
  "numOfRecords": 5,
  "elapsedMS": 120,
  "ts": "2026-05-02T12:00:00.000Z",
  "sessionId": "abc123",
  "userId": null,
  "clientLoc": {
    "city": "London",
    "country": "United Kingdom",
    "countryCode": "GB",
    "region": "England",
    "postcode": "SW1A",
    "geo": { "type": "Point", "coordinates": [-0.1278, 51.5074] }
  }
}
```

**`stage`** must be one of: `"submit"` | `"typeahead"`

**Response `204`:** No content (success)  
**Response `200` `{ ok: true }`:** Returned if event creation fails (non-blocking)

---

## Request Headers

| Header | Direction | Description |
|---|---|---|
| `x-request-id` | Response | Unique ID for each request, useful for tracing logs |
| `Authorization` | Request | Reserved for future authenticated endpoints |

---

## Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Query or body failed schema validation |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
