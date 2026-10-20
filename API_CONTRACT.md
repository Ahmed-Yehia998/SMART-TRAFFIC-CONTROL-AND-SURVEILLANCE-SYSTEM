# Smart Traffic API Contract

Base URL: `http://127.0.0.1:5000`

## Authentication
Every endpoint except `/api/health` needs this header:

    X-API-Key: <your key from .env>

## Response format
Success:

    { "success": true, "data": { ... } }

Error:

    { "success": false, "message": "Error description" }

| Status | Meaning |
|---|---|
| 200 | OK |
| 401 | Invalid or missing API key |
| 404 | Endpoint not found |
| 500 | Server error |

## Endpoints

### GET /api/health
No key needed. Returns `{ "success": true, "data": { "status": "ok" } }`

### GET /api/vehicles
    {
      "success": true,
      "data": {
        "camera_id": "cam_01",
        "total": 42,
        "by_type": { "car": 30, "truck": 5, "bus": 3, "motorcycle": 4 }
      }
    }

### GET /api/congestion
    {
      "success": true,
      "data": { "intersection_id": "int_01", "level": "high", "percentage": 85 }
    }

### GET /api/traffic-lights
    {
      "success": true,
      "data": { "intersection_id": "int_01", "status": "green", "remaining_seconds": 25 }
    }

### GET /api/incidents
    {
      "success": true,
      "data": [
        { "id": 1, "type": "accident", "location": "int_01",
          "status": "active", "time": "2026-10-20T12:30:00Z" }
      ]
    }

## Setup
1. Copy `.env.example` to `.env`
2. Put your own key in `API_KEY`
3. Run `python app.py`