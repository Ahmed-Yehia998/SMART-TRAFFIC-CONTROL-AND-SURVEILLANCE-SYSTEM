# Smart Traffic API Contract

Base URL (local): `http://127.0.0.1:5000`

## Authentication
- `GET` endpoints are open in local development, so the frontend never stores a key.
- `POST /api/detections` (used by the AI module) needs the header:

      X-API-Key: <value of API_KEY in .env>

- To protect GET endpoints too, set `REQUIRE_API_KEY_FOR_GET=true` in `.env`.
- CORS is enabled. Change the allowed origin with `CORS_ORIGIN` in `.env`.

## Response format
Success: `{ "success": true, "data": ... }`
Error: `{ "success": false, "message": "Error description" }`

| Status | Meaning |
|---|---|
| 200 / 201 | OK / Created |
| 400 | Invalid or missing JSON body or fields |
| 401 | Invalid or missing API key |
| 404 | Endpoint not found |
| 500 | Server error |

## Detection object (same fields as the AI output)
| Field | Type | Example |
|---|---|---|
| INTERSECTION | integer | 2 |
| VEHICLES | integer (>= 0) | 15 |
| EMERGENCY | boolean | true |
| ACCIDENT | boolean | false |
| TIME | string | "12:30" |

## Endpoints

### GET /api/health
Returns `{ "success": true, "data": { "status": "ok" } }`

### POST /api/detections
Body: Detection object, all 5 fields required.
Returns 201 `{ "success": true, "data": { "saved": true } }`
Returns 400 with a message if a field is missing or has the wrong type.

### GET /api/intersections
Latest Detection object for each intersection.

### GET /api/vehicles
    { "success": true, "data": [
      { "INTERSECTION": 1, "VEHICLES": 8, "TIME": "12:25" } ] }

### GET /api/congestion
`LEVEL` is "low" (< 10 vehicles), "medium" (< 20) or "high".

    { "success": true, "data": [
      { "INTERSECTION": 1, "VEHICLES": 8, "LEVEL": "low" } ] }

### GET /api/traffic-lights
`SIGNAL_STATUS` is "green", "yellow" or "red". Mock values for now.

    { "success": true, "data": [
      { "INTERSECTION": 2, "SIGNAL_STATUS": "green",
        "REMAINING_SECONDS": 30, "EMERGENCY_PRIORITY": true } ] }

### GET /api/incidents
Detections where `ACCIDENT` or `EMERGENCY` is true.

## Setup
1. Create a virtual environment and run `pip install -r requirements.txt`
2. Copy `.env.example` to `.env` and put your own key in `API_KEY`
3. Run `python app.py`