# Smart Traffic API Contract

Base URL: `http://127.0.0.1:5000`

## Authentication
Every endpoint except `/api/health` needs this header:

    X-API-Key: <your key from .env>

## Response format
Success: `{ "success": true, "data": ... }`
Error: `{ "success": false, "message": "Error description" }`

| Status | Meaning |
|---|---|
| 200 / 201 | OK / Created |
| 400 | Bad request (missing JSON or fields) |
| 401 | Invalid or missing API key |
| 404 | Endpoint not found |
| 500 | Server error |

## Detection object (same fields as the AI output)
    {
      "INTERSECTION": 2,
      "VEHICLES": 15,
      "EMERGENCY": true,
      "ACCIDENT": false,
      "TIME": "12:30"
    }

## Endpoints

### GET /api/health
No key needed. Returns `{ "success": true, "data": { "status": "ok" } }`

### POST /api/detections
AI sends detection results here. Body = Detection object, all 5 fields required.
Returns 201 `{ "success": true, "data": { "saved": true } }`
Returns 400 if the body is missing or a field is missing.

### GET /api/intersections
Latest detection for each intersection (list of Detection objects).

### GET /api/incidents
Detections where `ACCIDENT` or `EMERGENCY` is true.

### GET /api/traffic-lights
    {
      "success": true,
      "data": [
        { "INTERSECTION": 2, "GREEN_SECONDS": 40, "EMERGENCY_PRIORITY": true }
      ]
    }
`GREEN_SECONDS` is a mock rule for now.

## Setup
1. Copy `.env.example` to `.env`
2. Put your own key in `API_KEY`
3. Run `python app.py`