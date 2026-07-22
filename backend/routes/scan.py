# /backend/app/routes/scan.py
"""
Enhanced Scan Router with Problem Description
"""

import logging
from typing import Dict, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Header, Depends
from fastapi.responses import JSONResponse

from services.auth_service import get_current_uid
from services.scan_limit_service import (
    FREE_SCAN_LIMIT,
    get_client_ip,
    get_anon_scans_used,
    increment_anon_scans,
    get_remaining,
)
from services.groq_service import (
    analyze_ewaste_image,
    analyze_with_problem,
    find_marketplace_partners,
    generate_passport_info,
    generate_passport_qr
)
from services.calculator_service import (
    calculate_material_value,
    calculate_environmental_savings,
    calculate_eco_score,
    segment_components,
    predict_repair_costs,
    predict_buyback_price,
    predict_remaining_life,
    summarize_repairability,
    calculate_eco_points,
    detect_fraud,
    classify_device_from_materials,
    build_passport_history,
)
from services.firebase_service import save_scan_result, get_scan_result

router = APIRouter(prefix="/scan", tags=["Scan"])
logger = logging.getLogger(__name__)

@router.post("/analyze")
async def analyze_device(
    request: Request,
    file: UploadFile = File(...),
    problem: str = Form(default=""),
    location: str = Form(default="Unknown"),
    uid: Optional[str] = Depends(get_current_uid),
):
    # Validate file
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Only JPEG / PNG / WEBP images accepted.")
    
    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 10 MB).")

    # Enforce free scan limit for anonymous (not signed-in) users.
    # Signed-in users (uid present) get unlimited scans.
    client_ip = get_client_ip(request)
    if uid is None:
        used = get_anon_scans_used(client_ip)
        if used >= FREE_SCAN_LIMIT:
            raise HTTPException(
                status_code=403,
                detail=f"You've used all {FREE_SCAN_LIMIT} free scans. Sign in with Google to keep scanning.",
            )
    
    # Step 1: AI analysis with problem description
    try:
        if problem and problem.strip():
            ai_result = analyze_with_problem(image_bytes, problem)
            ai_result["user_problem"] = problem
        else:
            ai_result = analyze_ewaste_image(image_bytes)
            ai_result["user_problem"] = None
    except Exception as exc:
        logger.error(f"Groq Vision error: {exc}")
        ai_result = _basic_image_analysis(image_bytes)
        ai_result["user_problem"] = problem if problem else None
    
    # Step 2: If device type is unknown, try material-based classification
    device_type = ai_result.get("device_type", "Unknown")
    if "unknown" in device_type.lower() or device_type == "Unknown" or "Electronic Device" in device_type:
        materials = ai_result.get("materials", {})
        classification = classify_device_from_materials(materials)
        if classification.get("confidence", 0) > 0.5:
            ai_result["device_type"] = classification["device_type"]
            logger.info(f"Classified device as: {classification['device_type']} with confidence {classification['confidence']}")
    
    # Step 3: If problem is specified, adjust recommendations
    if problem and problem.strip():
        ai_result = _adjust_recommendations_for_problem(ai_result, problem)
    
    # Step 4: Material value
    materials = ai_result.get("materials", {})
    material_value = calculate_material_value(materials)
    ai_result["material_value_inr"] = material_value
    
    # Step 5: Environmental savings
    env = calculate_environmental_savings(
        device_type=ai_result.get("device_type", "Default"),
        recommendation=ai_result.get("recommendation", "Recycle"),
    )
    ai_result["carbon_saved_kg"] = env["carbon_saved_kg"]
    ai_result["water_saved_liters"] = env["water_saved_liters"]
    ai_result["landfill_reduction_kg"] = env["landfill_reduction_kg"]
    
    # Step 6: Component Segmentation
    components = segment_components(
        device_type=ai_result.get("device_type", "Default"),
        materials=materials
    )
    device_condition = ai_result.get("condition", "Fair")
    for comp in components:
        comp["condition"] = device_condition if device_condition in ("Good", "Excellent") else "Fair"
    ai_result["components"] = components
    
    # Step 7: EcoScore
    eco_data = calculate_eco_score(ai_result)
    ai_result["eco_score"] = eco_data["eco_score"]
    ai_result["sustainability_breakdown"] = eco_data["breakdown"]
    
    # Step 8: Repair cost prediction
    repair_estimates = predict_repair_costs(
        device_type=ai_result.get("device_type", "Default"),
        condition=ai_result.get("condition", "Fair"),
        age=ai_result.get("estimated_age", "3 years")
    )
    ai_result["repair_estimates"] = repair_estimates

    # Step 8b: Repairability summary (difficulty / cost range / success % / worth-it)
    repairability_summary = summarize_repairability(
        device_type=ai_result.get("device_type", "Default"),
        condition=ai_result.get("condition", "Fair"),
        age=ai_result.get("estimated_age", "3 years"),
        repairability_score=ai_result.get("repairability_score", 50),
        repair_estimates=repair_estimates,
    )
    ai_result["repairability_summary"] = repairability_summary
    
    # Step 9: Buyback prediction
    buyback = predict_buyback_price(
        device_type=ai_result.get("device_type", "Default"),
        brand=ai_result.get("brand", "Unknown"),
        condition=ai_result.get("condition", "Fair"),
        age=ai_result.get("estimated_age", "3 years")
    )
    ai_result["buyback_price_current"] = buyback["current_price"]
    ai_result["buyback_price_after_repair"] = buyback["price_after_repair"]
    ai_result["repair_profit"] = buyback["potential_profit"]
    ai_result["should_repair_for_resale"] = buyback["should_repair"]
    
    # Step 10: Remaining life
    # Never predict a number if the device is visibly destroyed or reported dead.
    visual_obs = ai_result.get("visual_observations", {}) or {}
    is_severely_damaged = bool(visual_obs.get("is_severely_damaged", False))
    problem_lower = (ai_result.get("user_problem") or "").lower()
    user_reported_dead = any(
        phrase in problem_lower
        for phrase in ("won't turn on", "wont turn on", "doesn't turn on", "not turning on", "dead", "won't power", "no power")
    )

    remaining_life = predict_remaining_life(
        device_type=ai_result.get("device_type", "Default"),
        condition=ai_result.get("condition", "Fair"),
        age=ai_result.get("estimated_age", "3 years"),
        is_severely_damaged=is_severely_damaged,
        user_reported_dead=user_reported_dead,
    )
    ai_result["remaining_life_months"] = remaining_life["remaining_life_months"]
    ai_result["remaining_life_confidence"] = remaining_life["confidence_score"]
    ai_result["component_failure_probabilities"] = remaining_life["component_failure_probabilities"]
    ai_result["predicted_failure_component"] = remaining_life["predicted_failure_component"]
    ai_result["remaining_life_available"] = remaining_life["available"]
    ai_result["remaining_life_unavailable_reason"] = remaining_life["unavailable_reason"]
    
    # Step 11: Fraud detection
    fraud_check = detect_fraud(
        device_type=ai_result.get("device_type", "Default"),
        materials=materials,
        location=location
    )
    ai_result["fraud_detection"] = fraud_check
    
    # Step 12: Eco Points
    eco_points = calculate_eco_points(ai_result)
    ai_result["eco_points"] = eco_points
    
    # Step 13: Marketplace
    try:
        partners = find_marketplace_partners(
            device_type=ai_result.get("device_type", "Unknown"),
            condition=ai_result.get("condition", "Unknown"),
            location=location,
        )
    except Exception as exc:
        logger.warning(f"Marketplace lookup failed: {exc}")
        partners = []
    ai_result["matched_partners"] = partners
    
    # Step 14: Passport
    try:
        ai_result["passport_note"] = generate_passport_info(ai_result)
    except Exception:
        ai_result["passport_note"] = ""
    
    # Step 15: Save and generate QR
    if uid:
        ai_result["user_id"] = uid
    passport_id = save_scan_result(ai_result, location)
    ai_result["passport_id"] = passport_id
    ai_result["passport_qr_url"] = generate_passport_qr(passport_id, ai_result)

    # Step 16: Circular Economy Passport history (ownership / repair / materials)
    ai_result["passport_history"] = build_passport_history(passport_id, ai_result)

    # Step 17: Scan quota info for the frontend banner. Signed-in users are
    # unlimited; anonymous users count against the free-scan limit tracked
    # by IP (see scan_limit_service.py).
    if uid is None:
        increment_anon_scans(client_ip)
        ai_result["scans_remaining"] = get_remaining(client_ip)
    else:
        ai_result["scans_remaining"] = None  # unlimited

    return JSONResponse(content=ai_result)

def _adjust_recommendations_for_problem(analysis: Dict, problem: str) -> Dict:
    """Adjust recommendations based on user's problem description"""
    problem_lower = problem.lower()
    
    if any(word in problem_lower for word in ["battery", "charging", "charge"]):
        analysis["reuse_score"] = max(0, analysis.get("reuse_score", 30) - 10)
        analysis["repair_score"] = max(0, analysis.get("repair_score", 40) + 20)
        if analysis.get("recommendation") == "Reuse":
            analysis["recommendation"] = "Repair"
            analysis["recommendation_reason"] = "User reported battery/charging issue. Repairing the battery would extend device life."
    
    elif any(word in problem_lower for word in ["screen", "display", "cracked", "broken"]):
        analysis["reuse_score"] = max(0, analysis.get("reuse_score", 30) - 20)
        analysis["repair_score"] = max(0, analysis.get("repair_score", 40) + 10)
        if analysis.get("recommendation") == "Reuse":
            analysis["recommendation"] = "Repair"
            analysis["recommendation_reason"] = "Screen/display issue detected. Screen replacement would make the device usable."
    
    elif any(word in problem_lower for word in ["slow", "lag", "performance"]):
        analysis["repair_score"] = max(0, analysis.get("repair_score", 40) + 15)
        analysis["repairability_score"] = max(0, analysis.get("repairability_score", 50) + 10)
        if analysis.get("recommendation") == "Recycle":
            analysis["recommendation"] = "Refurbish"
            analysis["recommendation_reason"] = "Performance issues can often be fixed with upgrades or cleaning."
    
    elif any(word in problem_lower for word in ["water", "liquid", "wet", "spill"]):
        analysis["reuse_score"] = max(0, analysis.get("reuse_score", 30) - 30)
        analysis["repair_score"] = max(0, analysis.get("repair_score", 40) - 20)
        analysis["recycle_score"] = min(100, analysis.get("recycle_score", 70) + 10)
        analysis["recommendation"] = "Recycle"
        analysis["recommendation_reason"] = "Water/liquid damage may have severely impacted internal components. Material recovery is recommended."
    
    elif any(word in problem_lower for word in ["not working", "dead", "won't turn", "brick"]):
        analysis["reuse_score"] = max(0, analysis.get("reuse_score", 30) - 25)
        analysis["repair_score"] = max(0, analysis.get("repair_score", 40) - 10)
        analysis["recycle_score"] = min(100, analysis.get("recycle_score", 70) + 15)
        if analysis.get("recommendation") in ("Reuse", "Repair"):
            analysis["recommendation"] = "Recycle"
            analysis["recommendation_reason"] = "Device is non-functional. Material recovery would be the most environmentally beneficial option."
    
    return analysis

@router.get("/quota")
async def get_quota(request: Request, uid: Optional[str] = Depends(get_current_uid)):
    """Lets the frontend show 'X free scans left' / 'unlimited' without
    having to actually run a scan first."""
    if uid:
        return {"authenticated": True, "unlimited": True, "remaining": None}

    client_ip = get_client_ip(request)
    used = get_anon_scans_used(client_ip)
    return {
        "authenticated": False,
        "unlimited": False,
        "limit": FREE_SCAN_LIMIT,
        "used": used,
        "remaining": get_remaining(client_ip),
    }


@router.get("/{passport_id}")
async def get_scan(passport_id: str):
    result = get_scan_result(passport_id)
    if not result:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return result

def _basic_image_analysis(image_bytes: bytes) -> Dict:
    """Fallback analysis when AI fails"""
    image_size = len(image_bytes)
    
    if image_size > 5 * 1024 * 1024:
        device_type = "Large Electronic Device"
        materials = {
            "copper_grams": 200,
            "aluminium_grams": 500,
            "gold_mg": 10,
            "silver_grams": 5,
            "plastic_grams": 800,
            "glass_grams": 100,
            "rubber_grams": 50,
            "steel_grams": 300
        }
    elif image_size > 2 * 1024 * 1024:
        device_type = "Medium Electronic Device"
        materials = {
            "copper_grams": 100,
            "aluminium_grams": 200,
            "gold_mg": 5,
            "silver_grams": 2,
            "plastic_grams": 300,
            "glass_grams": 50,
            "rubber_grams": 20,
            "steel_grams": 100
        }
    else:
        device_type = "Small Electronic Device"
        materials = {
            "copper_grams": 30,
            "aluminium_grams": 50,
            "gold_mg": 2,
            "silver_grams": 0.5,
            "plastic_grams": 100,
            "glass_grams": 20,
            "rubber_grams": 10,
            "steel_grams": 30
        }
    
    return {
        "device_type": device_type,
        "device_category": "Other",
        "brand": "Unknown",
        "identification_confidence": 40,
        "estimated_age": "Unknown",
        "condition": "Fair",
        "reuse_score": 30,
        "repair_score": 40,
        "recycle_score": 70,
        "repairability_score": 50,
        "components": [],
        "materials": materials,
        "recommendation": "Recycle",
        "recommendation_reason": "Electronic device detected. Recommended for material recovery.",
        "visual_observations": {
            "physical_damage": ["Unknown"],
            "visible_components": ["Electronic components"],
            "overall_appearance": "Unknown",
            "distinguishing_features": [],
            "is_screen_cracked": False,
            "has_physical_impact_damage": False,
            "is_stand_or_housing_intact": True,
            "has_missing_parts": False,
            "is_severely_damaged": False,
        },
        "possible_causes": [
            {"cause": "Main Logic Board Issue", "likelihood": 30},
            {"cause": "Power Supply Fault", "likelihood": 25},
        ],
    }