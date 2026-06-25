"""
Firebase Service
────────────────
Handles Firestore read / write for scan records,
passport data, and dashboard aggregates.
"""

import os
import uuid
import logging
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# ── Initialise Firebase (once) ─────────────────────────────
cred_path = os.getenv("FIREBASE_CREDENTIALS", "firebase_credentials.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()


# ───────────────────────────────────────────────────────────
# Scan Records
# ───────────────────────────────────────────────────────────
def save_scan_result(analysis: dict, location: str = "Unknown") -> str:
    """
    Persists a scan result to Firestore.
    Returns the generated passport_id (document ID).
    """
    passport_id = str(uuid.uuid4())[:8].upper()

    doc = {
        **analysis,
        "passport_id": passport_id,
        "location": location,
        "timestamp": datetime.utcnow().isoformat(),
    }

    db.collection("scan_results").document(passport_id).set(doc)
    logger.info("Saved scan %s to Firestore", passport_id)
    return passport_id


def get_scan_result(passport_id: str) -> dict | None:
    doc = db.collection("scan_results").document(passport_id).get()
    return doc.to_dict() if doc.exists else None


# ───────────────────────────────────────────────────────────
# Dashboard Aggregates
# ───────────────────────────────────────────────────────────
def get_dashboard_stats() -> dict:
    """
    Reads all scan results and aggregates stats for the
    government dashboard.
    """
    docs = db.collection("scan_results").stream()

    total_scans      = 0
    total_carbon     = 0.0
    total_value      = 0.0
    device_breakdown = {}
    hotspots         = {}

    for doc in docs:
        data = doc.to_dict()
        total_scans  += 1
        total_carbon += data.get("carbon_saved_kg", 0)
        total_value  += data.get("material_value_inr", 0)

        # Device breakdown
        dtype = data.get("device_type", "Unknown")
        device_breakdown[dtype] = device_breakdown.get(dtype, 0) + 1

        # Location hotspots
        loc = data.get("location", "Unknown")
        hotspots[loc] = hotspots.get(loc, 0) + 1

    hotspot_list = [
        {"location": loc, "count": cnt}
        for loc, cnt in sorted(hotspots.items(),
                               key=lambda x: x[1], reverse=True)
    ]

    return {
        "total_devices_scanned":  total_scans,
        "total_carbon_saved_kg":  round(total_carbon, 1),
        "total_material_value_inr": round(total_value, 2),
        "device_breakdown":       device_breakdown,
        "hotspots":               hotspot_list[:10],
    }