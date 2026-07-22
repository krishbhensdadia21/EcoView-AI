# /backend/app/routes/__init__.py
from .scan import router as scan_router
from .dashboard import router as dashboard_router
from .marketplace import router as marketplace_router
from .insights import router as insights_router
from .assistant import router as assistant_router

__all__ = [
    'scan_router',
    'dashboard_router', 
    'marketplace_router',
    'insights_router',
    'assistant_router'
]