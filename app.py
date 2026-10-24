import logging
import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request

load_dotenv()
API_KEY = os.getenv("API_KEY")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("smart-traffic")

app = Flask(__name__)

# Mock data, same fields as the AI output in the README
detections = [
    {"INTERSECTION": 1, "VEHICLES": 8, "EMERGENCY": False, "ACCIDENT": False, "TIME": "12:25"},
    {"INTERSECTION": 2, "VEHICLES": 15, "EMERGENCY": True, "ACCIDENT": False, "TIME": "12:30"},
    {"INTERSECTION": 3, "VEHICLES": 22, "EMERGENCY": False, "ACCIDENT": True, "TIME": "12:31"},
]

REQUIRED_FIELDS = ["INTERSECTION", "VEHICLES", "EMERGENCY", "ACCIDENT", "TIME"]


def latest_per_intersection():
    latest = {}
    for d in detections:
        latest[d["INTERSECTION"]] = d
    return list(latest.values())


@app.before_request
def check_api_key():
    if request.endpoint in (None, "health"):
        return
    if request.headers.get("X-API-Key") != API_KEY:
        logger.warning("Rejected request to %s: invalid or missing API key", request.path)
        return jsonify({"success": False, "message": "Invalid or missing API key"}), 401


@app.route("/api/health")
def health():
    return jsonify({"success": True, "data": {"status": "ok"}})


@app.route("/api/detections", methods=["POST"])
def add_detection():
    body = request.get_json(silent=True)
    if not body:
        logger.warning("POST /api/detections: no JSON body")
        return jsonify({"success": False, "message": "JSON body required"}), 400
    missing = [f for f in REQUIRED_FIELDS if f not in body]
    if missing:
        logger.warning("POST /api/detections: missing fields %s", missing)
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing)}"}), 400
    detections.append({f: body[f] for f in REQUIRED_FIELDS})
    logger.info("Saved detection for intersection %s", body["INTERSECTION"])
    return jsonify({"success": True, "data": {"saved": True}}), 201


@app.route("/api/intersections")
def intersections():
    return jsonify({"success": True, "data": latest_per_intersection()})


@app.route("/api/incidents")
def incidents():
    items = [d for d in detections if d["ACCIDENT"] or d["EMERGENCY"]]
    return jsonify({"success": True, "data": items})


@app.route("/api/traffic-lights")
def traffic_lights():
    data = []
    for d in latest_per_intersection():
        data.append({
            "INTERSECTION": d["INTERSECTION"],
            "GREEN_SECONDS": min(10 + d["VEHICLES"] * 2, 60),  # mock rule
            "EMERGENCY_PRIORITY": d["EMERGENCY"],
        })
    return jsonify({"success": True, "data": data})


@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "message": "Endpoint not found"}), 404


@app.errorhandler(500)
def server_error(error):
    logger.exception("Internal server error")
    return jsonify({"success": False, "message": "Internal server error"}), 500


if __name__ == "__main__":
    logger.info("Starting Smart Traffic backend")
    app.run(debug=True)