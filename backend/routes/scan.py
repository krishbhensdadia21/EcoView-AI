"""
Scan Router
"""

import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from services.groq_service import (
    analyze_ewaste_image,
    find_marketplace_partners,
    generate_passport_info
)
from services.calculator_service import (
    calculate_material_value,
    calculate_environmental_savings
)
from services.firebase_service import save_scan_result, get_scan_result

router = APIRouter(prefix="/scan", tags=["Scan"])
logger = logging.getLogger(__name__)


@router.post("/analyze")
async def analyze_device(
    file:     UploadFile = File(...),
    location: str        = Form(default="Unknown"),
):
    # Validate file type
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(
            status_code=400,
            detail="Only JPEG / PNG / WEBP images accepted."
        )

    image_bytes = await file.read()

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image too large (max 10 MB)."
        )

    # Step 1: Groq Vision analysis
    try:
        ai_result = analyze_ewaste_image(image_bytes)
    except Exception as exc:
        logger.error("Groq Vision error: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {exc}"
        )

    # Step 2: Material value
    materials = ai_result.get("materials", {})
    material_value = calculate_material_value(materials)
    ai_result["material_value_inr"] = material_value

    # Step 3: Environmental savings
    env = calculate_environmental_savings(
        device_type    = ai_result.get("device_type", "Default"),
        recommendation = ai_result.get("recommendation", "Recycle"),
    )
    ai_result["carbon_saved_kg"]    = env["carbon_saved_kg"]
    ai_result["water_saved_liters"] = env["water_saved_liters"]

    # Step 4: Marketplace partners
    try:
        partners = find_marketplace_partners(
            device_type = ai_result.get("device_type", "Unknown"),
            condition   = ai_result.get("condition", "Unknown"),
            location    = location,
        )
    except Exception as exc:
        logger.warning("Marketplace lookup failed: %s", exc)
        partners = []

    ai_result["matched_partners"] = partners

    # Step 5: Passport note
    try:
        ai_result["passport_note"] = generate_passport_info(ai_result)
    except Exception:
        ai_result["passport_note"] = ""

    # Step 6: Save to Firebase
    passport_id = save_scan_result(ai_result, location)
    ai_result["passport_id"] = passport_id

    return JSONResponse(content=ai_result)


@router.get("/{passport_id}")
async def get_scan(passport_id: str):
    result = get_scan_result(passport_id)
    if not result:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return result