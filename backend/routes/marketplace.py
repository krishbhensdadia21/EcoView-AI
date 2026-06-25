"""
Marketplace Router
──────────────────
POST /marketplace/match – find partners for a device (no image needed)
"""

from fastapi import APIRouter
from pydantic import BaseModel
from services.groq_service import find_marketplace_partners

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


class MatchRequest(BaseModel):
    device_type: str
    condition:   str
    location:    str


@router.post("/match")
async def match_partners(req: MatchRequest):
    partners = find_marketplace_partners(
        req.device_type, req.condition, req.location
    )
    return {"partners": partners}