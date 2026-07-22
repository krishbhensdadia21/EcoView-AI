# /backend/app/services/firebase_service.py
"""
Enhanced Firebase Service with manufacturer tracking
"""

import os
import uuid
import logging
from datetime import datetime
from typing import Dict, List

import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

cred_path = os.getenv("FIREBASE_CREDENTIALS", "firebase_credentials.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def get_clean_category(category: str, device_type: str) -> str:
    cat_lower = (category or "").lower()
    type_lower = (device_type or "").lower()
    
    if "laptop" in type_lower or "thinkpad" in type_lower or "macbook" in type_lower:
        return "Laptop"
    if "phone" in type_lower or "mobile" in type_lower or "iphone" in type_lower or "galaxy" in type_lower:
        return "Mobile Phone"
    if "keyboard" in type_lower:
        return "Keyboard"
    if "mouse" in type_lower:
        return "Computer Mouse"
    if "printer" in type_lower:
        return "Printer"
    if "tv" in type_lower or "television" in type_lower or "bravia" in type_lower or "monitor" in type_lower or "display" in type_lower:
        return "Monitor / TV"
    if "lathe" in type_lower or "bench lathe" in type_lower:
        return "Industrial Tool"
    
    if "computing" in cat_lower or "laptop" in cat_lower:
        return "Laptop"
    if "mobile" in cat_lower or "phone" in cat_lower:
        return "Mobile Phone"
    if "audio" in cat_lower or "headphone" in cat_lower or "speaker" in cat_lower:
        return "Audio Device"
    if "networking" in cat_lower or "router" in cat_lower or "switch" in cat_lower:
        return "Networking Device"
    if "power" in cat_lower or "battery" in cat_lower or "charger" in cat_lower:
        return "Power / Charger"
    if "circuit" in cat_lower or "pcb" in cat_lower:
        return "Circuit Board"
    if "consumer" in cat_lower:
        return "Consumer Electronic"
    
    if category and category.strip():
        return category.strip().title()
    return "Other Electronic"

def save_scan_result(analysis: Dict, location: str = "Unknown") -> str:
    passport_id = str(uuid.uuid4())[:8].upper()
    
    doc = {
        **analysis,
        "passport_id": passport_id,
        "location": location,
        "timestamp": datetime.utcnow().isoformat(),
        "device_type": analysis.get("device_type", "Unknown"),
        "brand": analysis.get("brand", "Unknown"),
        "eco_score": analysis.get("eco_score", 0),
        "eco_points": analysis.get("eco_points", 0),
        "recommendation": analysis.get("recommendation", "Unknown"),
        "carbon_saved_kg": analysis.get("carbon_saved_kg", 0),
        "material_value_inr": analysis.get("material_value_inr", 0),
        "components": analysis.get("components", [])
    }
    
    db.collection("scan_results").document(passport_id).set(doc)
    logger.info(f"Saved scan {passport_id} to Firestore")
    return passport_id

def get_scan_result(passport_id: str) -> Dict | None:
    doc = db.collection("scan_results").document(passport_id).get()
    return doc.to_dict() if doc.exists else None

def get_dashboard_stats() -> Dict:
    docs = db.collection("scan_results").stream()
    
    total_scans = 0
    total_carbon = 0.0
    total_value = 0.0
    total_eco_score = 0
    total_eco_points = 0
    device_breakdown = {}
    hotspots = {}
    manufacturer_data = {}
    
    for doc in docs:
        data = doc.to_dict()
        total_scans += 1
        total_carbon += data.get("carbon_saved_kg", 0)
        total_value += data.get("material_value_inr", 0)
        total_eco_score += data.get("eco_score", 0)
        total_eco_points += data.get("eco_points", 0)
        
        category = data.get("device_category") or ""
        device_type = data.get("device_type") or ""
        clean_cat = get_clean_category(category, device_type)
        device_breakdown[clean_cat] = device_breakdown.get(clean_cat, 0) + 1
        
        loc = data.get("location", "Unknown")
        hotspots[loc] = hotspots.get(loc, 0) + 1
        
        brand = data.get("brand", "Unknown")
        if brand not in manufacturer_data:
            manufacturer_data[brand] = {"count": 0, "total_eco_score": 0}
        manufacturer_data[brand]["count"] += 1
        manufacturer_data[brand]["total_eco_score"] += data.get("eco_score", 0)
    
    for brand in manufacturer_data:
        if manufacturer_data[brand]["count"] > 0:
            manufacturer_data[brand]["average_eco_score"] = round(
                manufacturer_data[brand]["total_eco_score"] / manufacturer_data[brand]["count"]
            )
        del manufacturer_data[brand]["total_eco_score"]
    
    hotspot_list = [
        {"location": loc, "count": cnt}
        for loc, cnt in sorted(hotspots.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return {
        "total_devices_scanned": total_scans,
        "total_carbon_saved_kg": round(total_carbon, 1),
        "total_material_value_inr": round(total_value, 2),
        "total_eco_points_earned": total_eco_points,
        "average_eco_score": round(total_eco_score / total_scans) if total_scans > 0 else 0,
        "device_breakdown": device_breakdown,
        "hotspots": hotspot_list[:10],
        "manufacturer_breakdown": manufacturer_data,
    }

# ADD THIS FUNCTION - it was missing
def get_manufacturer_data() -> Dict:
    """Get manufacturer breakdown for dashboard"""
    stats = get_dashboard_stats()
    return stats.get("manufacturer_breakdown", {})


def get_user_impact(uid: str) -> Dict:
    """
    Sums environmental impact + EcoPoints across every scan a specific
    signed-in user has made (their `user_id` on the scan doc == uid).
    Anonymous scans (no user_id) never appear here since they're not
    tied to any account.
    """
    docs = db.collection("scan_results").where("user_id", "==", uid).stream()

    total_scans = 0
    total_carbon = 0.0
    total_water = 0.0
    total_landfill = 0.0
    total_material_value = 0.0
    total_eco_points = 0
    device_breakdown: Dict[str, int] = {}

    for doc in docs:
        data = doc.to_dict()
        total_scans += 1
        total_carbon += data.get("carbon_saved_kg", 0) or 0
        total_water += data.get("water_saved_liters", 0) or 0
        total_landfill += data.get("landfill_reduction_kg", 0) or 0
        total_material_value += data.get("material_value_inr", 0) or 0
        total_eco_points += data.get("eco_points", 0) or 0

        category = data.get("device_category") or ""
        device_type = data.get("device_type") or ""
        clean_cat = get_clean_category(category, device_type)
        device_breakdown[clean_cat] = device_breakdown.get(clean_cat, 0) + 1

    return {
        "total_scans": total_scans,
        "total_carbon_saved_kg": round(total_carbon, 1),
        "total_water_saved_liters": round(total_water, 1),
        "total_landfill_reduction_kg": round(total_landfill, 1),
        "total_material_value_inr": round(total_material_value, 2),
        "total_eco_points": total_eco_points,
        "device_breakdown": device_breakdown,
    }


def get_leaderboard(limit: int = 20) -> List[Dict]:
    """
    Groups all scans by user_id and sums eco_points + carbon_saved_kg per
    user, then returns the top `limit` users sorted by eco_points desc.

    Anonymous scans (no user_id) are excluded — you can't rank someone who
    isn't signed in. Display name / photo are pulled from Firebase Auth
    (not stored on the scan doc itself), one lookup per distinct user —
    fine at current scale; worth caching if the user base grows large.
    """
    docs = db.collection("scan_results").stream()

    per_user: Dict[str, Dict] = {}
    for doc in docs:
        data = doc.to_dict()
        uid = data.get("user_id")
        if not uid:
            continue  # skip anonymous scans — nothing to rank them under

        if uid not in per_user:
            per_user[uid] = {"eco_points": 0, "carbon_saved_kg": 0.0, "scans": 0}

        per_user[uid]["eco_points"] += data.get("eco_points", 0) or 0
        per_user[uid]["carbon_saved_kg"] += data.get("carbon_saved_kg", 0) or 0
        per_user[uid]["scans"] += 1

    ranked = sorted(per_user.items(), key=lambda kv: kv[1]["eco_points"], reverse=True)[:limit]

    from firebase_admin import auth as firebase_auth

    leaderboard = []
    for rank, (uid, stats) in enumerate(ranked, start=1):
        display_name = "EcoView User"
        photo_url = None
        try:
            user_record = firebase_auth.get_user(uid)
            display_name = user_record.display_name or user_record.email or display_name
            photo_url = user_record.photo_url
        except Exception as exc:
            logger.warning(f"Could not fetch profile for uid {uid}: {exc}")

        leaderboard.append({
            "rank": rank,
            "uid": uid,
            "display_name": display_name,
            "photo_url": photo_url,
            "eco_points": stats["eco_points"],
            "carbon_saved_kg": round(stats["carbon_saved_kg"], 1),
            "scans": stats["scans"],
        })

    return leaderboard