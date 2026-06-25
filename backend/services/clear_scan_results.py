"""
Clear Scan Results
───────────────────
One-off utility to wipe all documents in the `scan_results` Firestore
collection, so the Government Dashboard starts from a clean slate
(0 devices, ₹0 recovered, empty charts).

Usage:
    python clear_scan_results.py            # asks for confirmation
    python clear_scan_results.py --yes       # skips confirmation

Run this from the same backend project/folder where firebase_service.py
lives (or adjust FIREBASE_CREDENTIALS / cred_path below to match it),
so it picks up the same Firebase credentials your app already uses.
"""

import os
import sys
import logging

import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

COLLECTION_NAME = "scan_results"


def init_firebase():
    cred_path = os.getenv("FIREBASE_CREDENTIALS", "firebase_credentials.json")
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    return firestore.client()


def clear_collection(db, collection_name: str, batch_size: int = 100) -> int:
    """Deletes all documents in a collection, batching to stay within
    Firestore write limits. Returns the total number deleted."""
    coll_ref = db.collection(collection_name)
    deleted_total = 0

    while True:
        docs = list(coll_ref.limit(batch_size).stream())
        if not docs:
            break

        batch = db.batch()
        for doc in docs:
            batch.delete(doc.reference)
        batch.commit()

        deleted_total += len(docs)
        logger.info("Deleted %d documents so far...", deleted_total)

    return deleted_total


def main():
    skip_confirm = "--yes" in sys.argv or "-y" in sys.argv

    db = init_firebase()

    existing = list(db.collection(COLLECTION_NAME).limit(1).stream())
    if not existing:
        logger.info("Collection '%s' is already empty. Nothing to do.", COLLECTION_NAME)
        return

    if not skip_confirm:
        answer = input(
            f"This will permanently delete ALL documents in '{COLLECTION_NAME}'. "
            f"Type 'yes' to continue: "
        )
        if answer.strip().lower() != "yes":
            logger.info("Aborted. No documents were deleted.")
            return

    total = clear_collection(db, COLLECTION_NAME)
    logger.info("Done. Deleted %d document(s) from '%s'.", total, COLLECTION_NAME)
    logger.info("Refresh the Government Dashboard — it should now show 0 across the board.")


if __name__ == "__main__":
    main()