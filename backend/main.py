# /backend/app/main.py
"""
EcoScan AI – FastAPI Application with all new features
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.scan import router as scan_router
from routes.dashboard import router as dashboard_router
from routes.marketplace import router as marketplace_router
from routes.insights import router as insights_router
from routes.assistant import router as assistant_router
from routes.user import router as user_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

app = FastAPI(
    title="EcoScan AI",
    description="AI-Powered E-Waste Intelligence Platform with Circular Economy Features",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_origin_regex=r"https://.*\.ngrok-free\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router)
app.include_router(dashboard_router)
app.include_router(marketplace_router)
app.include_router(insights_router)
app.include_router(assistant_router)
app.include_router(user_router)

@app.get("/")
async def root():
    return {
        "message": "EcoScan AI API is running 🌿",
        "version": "2.0.0",
        "features": [
            "AI Device Detection with Problem Context",
            "Component Segmentation",
            "EcoScore (0-100)",
            "Buyback Price Prediction",
            "Repair Cost Prediction",
            "Remaining Life Prediction",
            "AI Green Assistant",
            "Procurement Insights",
            "Impact Simulation",
            "Fraud Detection",
            "Eco Points (Gamification)"
        ],
        "docs": "/docs",
    }

@app.get("/health")
async def health():
    return {"status": "ok"}