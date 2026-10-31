import logging
import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request

load_dotenv()
API_KEY = os.getenv("API_KEY")
# Local dev: GET endpoints are open so the frontend never holds a key.
# Set REQUIRE_API_KEY_FOR_GET=true in .env to protect them too.
REQUIRE_KEY_FOR_GET = os.getenv("REQUIRE_API_KEY_FOR_GET", "false").lower() == "true"
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("smart-traffic")

app = Flask(__name__)

# Mock data for the 4 intersections (same fields as the AI output in the README)
detections = [
    {"INTERSECTION": 1, "VEHICLES": 8, "EMERGENCY": False, "ACCIDENT": False, "TIME": "12:25"},
    {"INTERSECTION": 2, "VEHICLES": 15, "EMERGENCY": True, "ACCIDENT": False, "TIME": "12:30"},
    {"INTERSECTION": 3, "VEHICLES": 22, "EMERGENCY": False, "ACCIDENT": True, "TIME": "12:31"},
    {"INTERSECTION": 4, "VEHICLES": 5, "EMERGENCY": False, "ACCIDENT": False, "TIME": "12:32"},
]

# Mock signal state: intersection -> (status, remaining seconds)
SIGNALS = {1: ("green", 25), 2: ("green", 30), 3: ("red", 18), 4: ("yellow", 3)}

REQUIRED_FIELDS = ["INTERSECTION", "VEHICLES", "EMERGENCY", "ACCIDENT", "TIME"]


def latest_per_intersection():
    latest = {}
    for d in detections:
        latest[d["INTERSECTION"]] = d
    return [latest[k] for k in sorted(latest)]


def congestion_level(vehicles):
    if vehicles < 10:
        return "low"
    if vehicles < 20:
        return "medium"
    return "high"


def is_int(value):
    return isinstance(value, int) and not isinstance(value, bool)


@app.before_request
def check_api_key():
    if request.method == "OPTIONS" or request.endpoint in (None, "health"):
        return
    if request.method == "GET" and not REQUIRE_KEY_FOR_GET:
        return
    if request.headers.get("X-API-Key") != API_KEY:
        logger.warning("Rejected %s %s: invalid or missing API key", request.method, request.path)
        return jsonify({"success": False, "message": "Invalid or missing API key"}), 401


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = CORS_ORIGIN
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, X-API-Key"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/api/health")
def health():
    return jsonify({"success": True, "data": {"status": "ok"}})


@app.route("/api/detections", methods=["POST"])
def add_detection():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        logger.warning("POST /api/detections: no JSON body")
        return jsonify({"success": False, "message": "JSON body required"}), 400
    missing = [f for f in REQUIRED_FIELDS if f not in body]
    if missing:
        logger.warning("POST /api/detections: missing fields %s", missing)
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing)}"}), 400
    if not is_int(body["INTERSECTION"]) or not is_int(body["VEHICLES"]) or body["VEHICLES"] < 0:
        return jsonify({"success": False, "message": "INTERSECTION and VEHICLES must be whole numbers (VEHICLES >= 0)"}), 400
    if not isinstance(body["EMERGENCY"], bool) or not isinstance(body["ACCIDENT"], bool):
        return jsonify({"success": False, "message": "EMERGENCY and ACCIDENT must be true or false"}), 400
    if not isinstance(body["TIME"], str):
        return jsonify({"success": False, "message": "TIME must be text like \"12:30\""}), 400
    detections.append({f: body[f] for f in REQUIRED_FIELDS})
    logger.info("Saved detection for intersection %s", body["INTERSECTION"])
    return jsonify({"success": True, "data": {"saved": True}}), 201


@app.route("/api/intersections")
def intersections():
    return jsonify({"success": True, "data": latest_per_intersection()})


@app.route("/api/vehicles")
def vehicles():
    data = [{"INTERSECTION": d["INTERSECTION"], "VEHICLES": d["VEHICLES"], "TIME": d["TIME"]}
            for d in latest_per_intersection()]
    return jsonify({"success": True, "data": data})


@app.route("/api/congestion")
def congestion():
    data = [{"INTERSECTION": d["INTERSECTION"], "VEHICLES": d["VEHICLES"],
             "LEVEL": congestion_level(d["VEHICLES"])}
            for d in latest_per_intersection()]
    return jsonify({"success": True, "data": data})


@app.route("/api/traffic-lights")
def traffic_lights():
    data = []
    for d in latest_per_intersection():
        status, remaining = SIGNALS.get(d["INTERSECTION"], ("red", 0))
        if d["EMERGENCY"]:
            status, remaining = "green", 30  # emergency vehicle priority
        data.append({
            "INTERSECTION": d["INTERSECTION"],
            "SIGNAL_STATUS": status,
            "REMAINING_SECONDS": remaining,
            "EMERGENCY_PRIORITY": d["EMERGENCY"],
        })
    return jsonify({"success": True, "data": data})


@app.route("/api/incidents")
def incidents():
    items = [d for d in detections if d["ACCIDENT"] or d["EMERGENCY"]]
    return jsonify({"success": True, "data": items})


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