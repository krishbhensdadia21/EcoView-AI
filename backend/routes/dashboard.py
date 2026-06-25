"""
Dashboard Router
────────────────
GET /dashboard/stats – aggregated stats for government dashboard
"""

from fastapi import APIRouter
from services.firebase_service import get_dashboard_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def dashboard_stats():
    return get_dashboard_stats()