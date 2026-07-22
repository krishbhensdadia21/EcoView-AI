# /backend/app/routes/assistant.py
"""
AI Green Assistant Router
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
import logging

from services.groq_service import chat_with_green_assistant, generate_repair_manual

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assistant", tags=["Assistant"])

class ChatRequest(BaseModel):
    question: str
    device_context: Optional[Dict] = None

class RepairManualRequest(BaseModel):
    device_type: str
    repair_type: str

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        logger.info(f"Chat request received: {request.question[:50]}...")
        response = chat_with_green_assistant(
            question=request.question,
            device_context=request.device_context
        )
        return {"response": response}
    except Exception as exc:
        logger.error(f"Chat failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(exc)}")

@router.post("/repair-manual")
async def get_repair_manual(request: RepairManualRequest):
    try:
        manual = generate_repair_manual(
            device_type=request.device_type,
            repair_type=request.repair_type
        )
        return {"manual": manual}
    except Exception as exc:
        logger.error(f"Manual generation failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to generate manual: {str(exc)}")

@router.get("/test")
async def test_assistant():
    return {"status": "Assistant router is working!"}