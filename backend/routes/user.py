# /backend/app/routes/user.py
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query

from services.auth_service import get_current_uid
from services.firebase_service import get_user_impact, get_leaderboard

router = APIRouter(tags=["User"])


@router.get("/user/impact")
async def user_impact(uid: Optional[str] = Depends(get_current_uid)):
    """Lifetime environmental impact + EcoPoints for the signed-in user."""
    if uid is None:
        raise HTTPException(status_code=401, detail="Sign in to see your impact.")
    return get_user_impact(uid)


@router.get("/leaderboard")
async def leaderboard(
    limit: int = Query(default=20, ge=1, le=100),
    uid: Optional[str] = Depends(get_current_uid),
):
    """
    Top users ranked by total EcoPoints. Public — no login required to view.
    If the caller is signed in, also returns `your_rank` (null if they
    haven't scanned anything yet, or aren't in the top-N pool used to
    compute it).
    """
    board = get_leaderboard(limit=limit)

    your_rank = None
    if uid:
        match = next((entry for entry in board if entry["uid"] == uid), None)
        if match:
            your_rank = match["rank"]

    return {"leaderboard": board, "your_rank": your_rank}