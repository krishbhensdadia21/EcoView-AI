# /backend/app/routes/dashboard.py
"""
Enhanced Dashboard Router with predictions and insights
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from services.firebase_service import get_dashboard_stats, get_manufacturer_data
from services.calculator_service import predict_future_hotspots, simulate_impact
from services.insights_service import get_insights, generate_procurement_recommendations

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

class ImpactSimulationRequest(BaseModel):
    policy_change: str
    value: float

class InsightQueryRequest(BaseModel):
    question: str

@router.get("/stats")
async def dashboard_stats():
    stats = get_dashboard_stats()
    stats["manufacturer_breakdown"] = get_manufacturer_data()
    
    if stats.get("hotspots"):
        stats["predicted_next_month_devices"] = predict_future_hotspots(stats["hotspots"])
    
    return stats

@router.post("/simulate")
async def impact_simulation(request: ImpactSimulationRequest):
    current_stats = get_dashboard_stats()
    result = simulate_impact(
        current_stats=current_stats,
        policy_change=request.policy_change,
        value=request.value
    )
    return result

@router.post("/insights")
async def get_procurement_insights(request: InsightQueryRequest):
    try:
        stats = get_dashboard_stats()
        result = get_insights(request.question, stats)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Insight generation failed: {exc}")

@router.get("/recommendations")
async def get_recommendations():
    stats = get_dashboard_stats()
    recommendations = generate_procurement_recommendations(stats)
    return {"recommendations": recommendations}