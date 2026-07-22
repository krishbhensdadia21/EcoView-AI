# /backend/app/schemas.py
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

# ──────────────────────────────────────────────
# Request / Response Schemas
# ──────────────────────────────────────────────

class ComponentSegmentation(BaseModel):
    """Individual component detected in the device"""
    name: str
    weight_grams: float
    material: str
    recoverable_value_inr: float
    condition: str
    is_removable: Optional[bool] = True

class DeviceAnalysisResponse(BaseModel):
    """Enhanced analysis result with all new features"""
    device_type: str
    device_category: str
    brand: Optional[str]
    identification_confidence: int
    estimated_age: str
    condition: str
    user_problem: Optional[str]  # NEW: User's problem description
    
    # Scores
    reuse_score: int
    repair_score: int
    recycle_score: int
    repairability_score: int
    
    # EcoScore
    eco_score: int
    sustainability_breakdown: Dict
    
    # Recommendation
    recommendation: str
    recommendation_reason: str
    
    # Visual inspection (Section 2)
    visual_observations: Dict

    # AI diagnostic reasoning (Section 4)
    possible_causes: List[Dict]

    # Components
    components: List[ComponentSegmentation]
    
    # Economic & environmental
    materials: Dict
    material_value_inr: float
    carbon_saved_kg: float
    water_saved_liters: float
    landfill_reduction_kg: float
    
    # Repair cost prediction
    repair_estimates: Dict
    repairability_summary: Dict
    
    # Buyback prediction
    buyback_price_current: float
    buyback_price_after_repair: float
    repair_profit: float
    should_repair_for_resale: bool
    
    # Remaining life
    remaining_life_months: Optional[int]
    remaining_life_confidence: Optional[int]
    remaining_life_available: bool
    remaining_life_unavailable_reason: Optional[str]
    component_failure_probabilities: Dict
    predicted_failure_component: str
    
    # Fraud detection
    fraud_detection: Dict
    
    # Marketplace
    matched_partners: List[Dict]
    
    # Passport
    passport_id: str
    passport_qr_url: str
    passport_note: Optional[str]
    passport_history: Dict
    eco_points: int

class MarketplaceRequest(BaseModel):
    device_type: str
    condition: str
    location: str

class DashboardStats(BaseModel):
    total_devices_scanned: int
    total_carbon_saved_kg: float
    total_material_value_inr: float
    total_eco_points_earned: int
    average_eco_score: float
    device_breakdown: Dict
    hotspots: List[Dict]
    manufacturer_breakdown: Dict
    predicted_next_month_devices: Optional[List[Dict]]

class InsightQuery(BaseModel):
    question: str
    context: Optional[Dict] = None

class ImpactSimulation(BaseModel):
    policy_change: str
    value: float

class ChatRequest(BaseModel):
    question: str
    device_context: Optional[Dict] = None

class RepairManualRequest(BaseModel):
    device_type: str
    repair_type: str