# /backend/app/services/scan_limit_service.py
"""
Enforces "5 free scans before login" for anonymous (not signed-in) users,
tracked by client IP as a backend backup to the frontend's own localStorage
counter (which a user could clear or bypass in incognito).

NOTE — this is an in-memory counter, intentionally simple:
- Resets if the server restarts.
- Not shared across multiple server instances/workers.
- Shared IPs (offices, mobile carriers, VPNs) share one quota.
For production at scale, swap `_anon_scan_counts` for Redis (or a Firestore
collection keyed by IP) so it survives restarts and works across instances —
the get/increment functions below are the only two places that would need
to change.
"""

from typing import Dict
from fastapi import Request

FREE_SCAN_LIMIT = 5

_anon_scan_counts: Dict[str, int] = {}


def get_client_ip(request: Request) -> str:
    """Prefer X-Forwarded-For (set by proxies/load balancers) over the raw
    socket address, since the latter is often just the proxy's own IP."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def get_anon_scans_used(ip: str) -> int:
    return _anon_scan_counts.get(ip, 0)


def increment_anon_scans(ip: str) -> int:
    _anon_scan_counts[ip] = _anon_scan_counts.get(ip, 0) + 1
    return _anon_scan_counts[ip]


def get_remaining(ip: str) -> int:
    return max(0, FREE_SCAN_LIMIT - get_anon_scans_used(ip))
