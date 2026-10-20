import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request

load_dotenv()
API_KEY = os.getenv("API_KEY")

app = Flask(__name__)


@app.before_request
def check_api_key():
    if request.endpoint in (None, "health"):
        return
    if request.headers.get("X-API-Key") != API_KEY:
        return jsonify({
            "success": False,
            "message": "Invalid or missing API key"
        }), 401


@app.route("/api/health")
def health():
    return jsonify({"success": True, "data": {"status": "ok"}})


@app.route("/api/vehicles")
def vehicles():
    return jsonify({
        "success": True,
        "data": {
            "camera_id": "cam_01",
            "total": 42,
            "by_type": {"car": 30, "truck": 5, "bus": 3, "motorcycle": 4}
        }
    })


@app.route("/api/congestion")
def congestion():
    return jsonify({
        "success": True,
        "data": {
            "intersection_id": "int_01",
            "level": "high",
            "percentage": 85
        }
    })


@app.route("/api/traffic-lights")
def traffic_lights():
    return jsonify({
        "success": True,
        "data": {
            "intersection_id": "int_01",
            "status": "green",
            "remaining_seconds": 25
        }
    })


@app.route("/api/incidents")
def incidents():
    return jsonify({
        "success": True,
        "data": [
            {
                "id": 1,
                "type": "accident",
                "location": "int_01",
                "status": "active",
                "time": "2026-10-20T12:30:00Z"
            },
            {
                "id": 2,
                "type": "stopped_vehicle",
                "location": "int_02",
                "status": "resolved",
                "time": "2026-10-20T11:45:00Z"
            }
        ]
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "Endpoint not found"
    }), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500


if __name__ == "__main__":
    app.run(debug=True)