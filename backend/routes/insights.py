# insights.py - New route for AI insights
"""
AI Insights Router
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.insights_service import get_insights, generate_procurement_recommendations
from services.firebase_service import get_dashboard_stats

router = APIRouter(prefix="/insights", tags=["Insights"])

class QuestionRequest(BaseModel):
    question: str
    context: Optional[dict] = None

@router.post("/ask")
async def ask_insights(request: QuestionRequest):
    """Ask a question about e-waste data"""
    try:
        stats = get_dashboard_stats()
        result = get_insights(request.question, stats)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to get insights: {exc}")

@router.get("/recommendations")
async def get_recommendations():
    """Get AI-generated procurement recommendations"""
    try:
        stats = get_dashboard_stats()
        recommendations = generate_procurement_recommendations(stats)
        return {"recommendations": recommendations}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {exc}")