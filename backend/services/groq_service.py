"""
Groq Service
────────────
Uses LLaMA-3.2-Vision to analyse an e-waste image and return
structured JSON with device details, scores, and recommendations.
"""

import os
import json
import base64
import re
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# ── Groq client ────────────────────────────────────────────
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── Vision model (supports image input) ────────────────────
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
TEXT_MODEL   = "llama-3.3-70b-versatile"


# ───────────────────────────────────────────────────────────
# Helper – encode image to base64
# ───────────────────────────────────────────────────────────
def encode_image(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")


# ───────────────────────────────────────────────────────────
# Core – analyse e-waste image
# ───────────────────────────────────────────────────────────
def analyze_ewaste_image(image_bytes: bytes) -> dict:
    """
    Send the image to Groq Vision and parse the structured JSON response.
    Returns a dict that matches DeviceAnalysisResponse fields.
    """
    base64_image = encode_image(image_bytes)

    prompt = """
You are an expert e-waste analyst AI. Analyse the electronic device in this image
and respond ONLY with a valid JSON object – no markdown, no extra text.

JSON schema (fill every field):
{
  "device_type":            "<string>  e.g. Laptop / Mobile / GPU / Monitor",
  "brand":                  "<string>  or 'Unknown'",
  "estimated_age":          "<string>  e.g. '3-5 years'",
  "condition":              "<string>  Poor | Fair | Good | Excellent",

  "reuse_score":            <0-100>,
  "repair_score":           <0-100>,
  "recycle_score":          <0-100>,
  "repairability_score":    <0-100>,

  "recommendation":         "<Reuse | Repair | Refurbish | Recycle>",
  "recommendation_reason":  "<one clear sentence>",

  "materials": {
    "copper_grams":    <number>,
    "aluminium_grams": <number>,
    "gold_mg":         <number>,
    "silver_grams":    <number>,
    "plastic_grams":   <number>
  },

  "material_value_inr": <number>,
  "carbon_saved_kg":    <number>,
  "water_saved_liters": <number>
}

IMPORTANT – the four scores and the recommendation are NOT independent.
Decide them together, in this order, so they stay consistent with each other:

Step 1 – Score the device on all four 0-100 scales, based on what you see
(visible damage, age, brand/model desirability, ease of disassembly):
  reuse_score          → how usable the device is RIGHT NOW, with no work done
  repair_score         → how much a repair (not a full refurbish) would help
  repairability_score  → how easy the device is to open / find spare parts for
  recycle_score        → how much value is in MATERIAL RECOVERY specifically
                          (only score this high if recovering materials is a
                          BETTER outcome than reuse/repair/refurbish – a device
                          in Fair condition with a fixable fault is NOT a high
                          recycle_score device, even though it is old)

Step 2 – Pick exactly ONE recommendation using these rules, checked in order:
  if reuse_score  ≥ 70                        → "Reuse"
  elif repair_score ≥ 60                       → "Repair"
  elif reuse_score ≥ 40 OR repairability_score ≥ 50 → "Refurbish"
  else                                          → "Recycle"

Step 3 – Self-check before responding: the recommendation MUST be the single
highest-scoring action among reuse/repair/refurbish-worthiness/recycle for
THIS device. If recommendation is "Refurbish" or "Reuse" or "Repair",
recycle_score must be LOWER than at least one of the other three scores –
a salvageable device should never carry a recycle_score of 70+ alongside
a non-Recycle recommendation. If recommendation is "Recycle", recycle_score
should be the highest of the four, and reuse_score should be low (< 40).
"""

    response = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
        max_tokens=1024,
        temperature=0.1,   # low temperature → deterministic, factual output
    )

    raw = response.choices[0].message.content.strip()
    logger.debug("Groq raw response: %s", raw)

    # ── Parse JSON (strip accidental markdown fences) ──────
    cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
    data = json.loads(cleaned)

    return _enforce_score_recommendation_consistency(data)


def _enforce_score_recommendation_consistency(data: dict) -> dict:
    """
    Safety net: the prompt asks the model to keep the 4 scores and the
    recommendation aligned, but LLM output isn't guaranteed. If the
    recommendation doesn't match what the scores themselves imply
    (e.g. recycle_score is high while recommendation is "Refurbish"),
    recompute the recommendation from the scores so the UI never shows
    a contradictory result like the one this function exists to prevent.
    """
    try:
        reuse = float(data.get("reuse_score", 0))
        repair = float(data.get("repair_score", 0))
        recycle = float(data.get("recycle_score", 0))
        repairability = float(data.get("repairability_score", 0))
    except (TypeError, ValueError):
        return data  # malformed scores — leave as-is rather than guess

    if reuse >= 70:
        expected = "Reuse"
    elif repair >= 60:
        expected = "Repair"
    elif reuse >= 40 or repairability >= 50:
        expected = "Refurbish"
    else:
        expected = "Recycle"

    # Extra guard: recycle_score should never be the top score unless
    # the recommendation actually is "Recycle".
    scores = {"Reuse": reuse, "Repair": repair, "Refurbish": repairability, "Recycle": recycle}
    top_action = max(scores, key=scores.get)
    if top_action == "Recycle" and expected != "Recycle":
        expected = "Recycle"

    if data.get("recommendation") != expected:
        logger.warning(
            "Groq recommendation '%s' inconsistent with scores %s — correcting to '%s'",
            data.get("recommendation"), scores, expected,
        )
        data["recommendation"] = expected

    return data


# ───────────────────────────────────────────────────────────
# Supplementary – find marketplace partners (text model)
# ───────────────────────────────────────────────────────────
def find_marketplace_partners(device_type: str,
                               condition: str,
                               location: str) -> list:
    """
    Ask the text LLM to suggest realistic partner types for
    the given device and location in India.
    """
    prompt = f"""
You are an e-waste marketplace coordinator in India.

Device   : {device_type}
Condition: {condition}
Location : {location}

Suggest 4 realistic partners (NGOs, schools, refurbishers, recyclers)
who would accept this device. Respond ONLY with a JSON array:
[
  {{
    "name":     "<org name>",
    "type":     "<NGO | School | Refurbisher | Recycler>",
    "location": "<city, state>",
    "contact":  "<dummy phone or email>",
    "accepts":  "<what they accept>",
    "distance_km": <number>
  }}
]
"""

    response = client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512,
        temperature=0.3,
    )

    raw = response.choices[0].message.content.strip()
    cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
    return json.loads(cleaned)


# ───────────────────────────────────────────────────────────
# Supplementary – generate Digital Product Passport blurb
# ───────────────────────────────────────────────────────────
def generate_passport_info(device_data: dict) -> str:
    """
    Returns a short predictive maintenance note for the device.
    """
    prompt = f"""
You are an IoT predictive-maintenance AI.

Device data: {json.dumps(device_data)}

Write ONE concise paragraph (≤ 60 words) predicting the most likely
component to fail next and when, and recommending a proactive action.
Do NOT use bullet points or markdown.
"""

    response = client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
        temperature=0.4,
    )

    return response.choices[0].message.content.strip()