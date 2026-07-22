# /backend/app/services/auth_service.py
"""
Verifies Firebase ID tokens sent by the frontend after Google Sign-In.

This uses the SAME firebase_admin app already initialized in
firebase_service.py (Firestore + Auth share one Admin SDK app), so no
extra credentials/setup is needed here.
"""

import logging
from typing import Optional

from fastapi import Header
from firebase_admin import auth as firebase_auth

# Ensures firebase_admin.initialize_app() has already run before we call
# firebase_auth.verify_id_token(). firebase_service.py runs it at import time.
import services.firebase_service  # noqa: F401

logger = logging.getLogger(__name__)


async def get_current_uid(authorization: Optional[str] = Header(default=None)) -> Optional[str]:
    """
    FastAPI dependency. Reads `Authorization: Bearer <idToken>`, verifies it
    with Firebase Admin, and returns the user's uid.

    Returns None (never raises) if there's no header, it's malformed, or the
    token is invalid/expired — callers treat `None` as "anonymous user" and
    decide what that means (e.g. enforce the free-scan limit), rather than
    getting a hard 401 for what might just be a logged-out visitor.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None

    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded.get("uid")
    except Exception as exc:
        logger.warning(f"Firebase ID token verification failed: {exc}")
        return None
