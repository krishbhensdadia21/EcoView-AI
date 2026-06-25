"""
EcoScan AI – FastAPI Application Entry Point
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.scan        import router as scan_router
from routes.dashboard   import router as dashboard_router
from routes.marketplace import router as marketplace_router

# ── Logging ───────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

# ── FastAPI app ───────────────────────────────────────────
app = FastAPI(
    title="EcoScan AI",
    description="AI-Powered E-Waste Intelligence Platform",
    version="1.0.0",
)

# ── CORS (allow React dev server) ─────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────
app.include_router(scan_router)
app.include_router(dashboard_router)
app.include_router(marketplace_router)


@app.get("/")
async def root():
    return {
        "message": "EcoScan AI API is running 🌿",
        "docs":    "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}