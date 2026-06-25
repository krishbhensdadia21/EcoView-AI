from pydantic import BaseModel
from typing import Optional, List

# ──────────────────────────────────────────────
# Request / Response Schemas
# ──────────────────────────────────────────────

class DeviceAnalysisResponse(BaseModel):
    """
    Complete analysis result returned to the frontend
    after an image is scanned.
    """
    device_type: str
    brand: Optional[str]
    estimated_age: str
    condition: str

    # Scores (0 – 100)
    reuse_score: int
    repair_score: int
    recycle_score: int
    repairability_score: int

    # Primary recommendation
    recommendation: str          # "Reuse" | "Repair" | "Refurbish" | "Recycle"
    recommendation_reason: str

    # Economic & environmental data
    materials: dict              # { "copper": "120g", ... }
    material_value_inr: float    # ₹ value of recoverable materials
    carbon_saved_kg: float
    water_saved_liters: float

    # Marketplace
    matched_partners: List[dict] # [{ name, type, location, contact }, ...]

    # Digital passport
    passport_id: str


class MarketplaceRequest(BaseModel):
    device_type: str
    condition: str
    location: str


class DashboardStats(BaseModel):
    total_devices_scanned: int
    total_carbon_saved_kg: float
    total_material_value_inr: float
    device_breakdown: dict
    hotspots: List[dict]