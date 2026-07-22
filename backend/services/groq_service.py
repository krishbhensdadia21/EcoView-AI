# /backend/app/services/groq_service.py
"""
Enhanced Groq Service with Generic Device Detection and Problem Context

Adds (on top of the original device analysis):
- identification_confidence  -> Section 1 "Confidence: 98%"
- visual_observations.*      -> Section 2 visual inspection checklist booleans
- possible_causes[]          -> Section 4 AI Diagnostic Insights (cause + likelihood %)
"""

import os
import json
import base64
import re
import logging
from typing import Dict, List, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
TEXT_MODEL = "llama-3.3-70b-versatile"

JSON_SCHEMA_BLOCK = """
JSON Schema:
{
  "device_type": "Specific device name",
  "device_category": "Computing | Mobile | Networking | Audio | Power | Consumer | Circuitry | Other",
  "brand": "Brand name if visible or 'Unknown'",
  "identification_confidence": 0-100,
  "estimated_age": "X-Y years based on visual cues or 'Unknown'",
  "condition": "Poor | Fair | Good | Excellent",

  "reuse_score": 0-100,
  "repair_score": 0-100,
  "recycle_score": 0-100,
  "repairability_score": 0-100,

  "components": [
    {
      "name": "Component name",
      "estimated_weight_g": 0,
      "material_type": "metal | plastic | circuit | precious | glass | rubber",
      "condition": "Poor | Fair | Good",
      "recoverable_value_inr": 0,
      "is_removable": true
    }
  ],

  "materials": {
    "copper_grams": 0,
    "aluminium_grams": 0,
    "gold_mg": 0,
    "silver_grams": 0,
    "plastic_grams": 0,
    "glass_grams": 0,
    "rubber_grams": 0,
    "steel_grams": 0
  },

  "recommendation": "Reuse | Repair | Refurbish | Recycle",
  "recommendation_reason": "One clear sentence explaining why",

  "visual_observations": {
    "physical_damage": ["short observed-damage phrases, e.g. 'Screen severely cracked'"],
    "visible_components": ["list of visible parts"],
    "overall_appearance": "Clean | Dusty | Burned | Corroded | Damaged | Pristine",
    "distinguishing_features": ["feature1", "feature2"],
    "is_screen_cracked": false,
    "has_physical_impact_damage": false,
    "is_stand_or_housing_intact": true,
    "has_missing_parts": false,
    "is_severely_damaged": false
  },

  "possible_causes": [
    {"cause": "Display Panel Failure", "likelihood": 0-100},
    {"cause": "Power Supply Fault", "likelihood": 0-100},
    {"cause": "Main Logic Board Issue", "likelihood": 0-100},
    {"cause": "Loose Internal Cable", "likelihood": 0-100}
  ]
}

IDENTIFICATION CONFIDENCE:
- identification_confidence is how certain you are about device_type + brand from visible
  cues (logos, form factor, ports, screen bezel style). Use 90-99 only when brand/model
  cues are clearly visible; use 50-75 for a generic guess from form factor alone.

VISUAL INSPECTION BOOLEANS (Section 2 — observed only, never inferred from user text):
- Base every boolean strictly on what is visible in the image. Do not factor in the
  user's reported problem here — that belongs only to possible_causes.
- is_severely_damaged = true if there is cracking, charring, missing major parts, or
  heavy corrosion clearly visible.

POSSIBLE CAUSES (Section 4 — AI Diagnostic Insights):
- Always return 3-5 entries ordered from highest to lowest likelihood.
- If a user problem is given, weight likelihoods toward causes consistent with both the
  visible damage AND the reported symptom. If no problem is given, base purely on visible
  damage.
- These are estimates, not confirmed diagnoses — phrase causes as short component/system
  names (e.g. "Power Supply Fault"), not full sentences.

SCORING GUIDELINES:
- If heavily damaged/corroded: reuse_score < 20, repair_score < 30, recycle_score > 60
- If old but intact: reuse_score 30-50, repair_score 40-60
- If modern and working: reuse_score > 70
- If has valuable materials (gold, silver): recycle_score +20
- If easy to repair (modular design): repairability_score +30

Recommendation rules (in order):
- reuse_score >= 70 → "Reuse"
- repair_score >= 60 → "Repair"
- reuse_score >= 40 OR repairability_score >= 50 → "Refurbish"
- otherwise → "Recycle"
"""


def encode_image(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")


def analyze_ewaste_image(image_bytes: bytes) -> Dict:
    """Basic image analysis without problem context"""
    base64_image = encode_image(image_bytes)

    prompt = f"""
You are an expert e-waste analyst AI with advanced computer vision capabilities.
Analyze the electronic device in this image and respond ONLY with a valid JSON object.

IDENTIFICATION STRATEGY:
1. Look for distinguishing features (screen, keyboard, ports, fans, etc.)
2. Consider the form factor (size, shape, thickness)
3. Identify visible components (battery, circuit board, connectors)
4. If unsure, describe what you see and make your best guess
{JSON_SCHEMA_BLOCK}
"""

    return _run_vision_analysis(prompt, base64_image)


def analyze_with_problem(image_bytes: bytes, problem: str) -> Dict:
    """Analyze image with user's problem description"""
    base64_image = encode_image(image_bytes)

    prompt = f"""
You are an expert e-waste analyst AI with advanced computer vision capabilities.
Analyze the electronic device in this image and respond ONLY with a valid JSON object.

USER'S PROBLEM DESCRIPTION:
{problem}

Use this information to inform recommendation, scores, and possible_causes only.
Visual inspection booleans must still reflect ONLY what is visible in the image.
{JSON_SCHEMA_BLOCK}

IMPORTANT: If the user mentions specific problems (battery issue, cracked screen, etc.),
factor that into your scoring, recommendation, and possible_causes. The user's problem
should influence the recommendation.
"""

    return _run_vision_analysis(prompt, base64_image, with_problem=True)


def _run_vision_analysis(prompt: str, base64_image: str, with_problem: bool = False) -> Dict:
    raw = ""
    try:
        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
                    {"type": "text", "text": prompt}
                ]
            }],
            max_tokens=1280,
            temperature=0.1,
        )

        raw = response.choices[0].message.content.strip()
        logger.info(f"Raw AI response{' (with problem)' if with_problem else ''}: {raw[:200]}...")
        cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
        data = json.loads(cleaned)
        data = _enforce_score_recommendation_consistency(data)
        data = _enhance_with_heuristics(data)
        return data

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        return _extract_partial_data(raw)
    except Exception as e:
        logger.error(f"Vision analysis error: {e}")
        return _get_default_analysis()


def _enhance_with_heuristics(data: Dict) -> Dict:
    """Add heuristic-based improvements"""

    device_type = data.get("device_type", "").lower()

    if "unknown" in device_type or data.get("device_type") == "Unknown":
        observations = data.get("visual_observations", {})
        features = observations.get("distinguishing_features", [])
        components_visible = observations.get("visible_components", [])
        features_str = " ".join(features).lower()
        components_str = " ".join(components_visible).lower()

        if "screen" in features_str and ("key" in features_str or "trackpad" in features_str):
            data["device_type"] = "Laptop"
            data["device_category"] = "Computing"
        elif "screen" in features_str and "stand" in features_str:
            data["device_type"] = "Monitor"
            data["device_category"] = "Computing"
        elif "key" in features_str and "screen" not in features_str:
            data["device_type"] = "Keyboard"
            data["device_category"] = "Computing"
        elif "fan" in features_str and "port" in features_str:
            data["device_type"] = "Desktop"
            data["device_category"] = "Computing"
        elif "battery" in components_str:
            data["device_type"] = "Battery"
            data["device_category"] = "Power"
        elif "circuit" in components_str or "board" in components_str:
            data["device_type"] = "Circuit Board"
            data["device_category"] = "Circuitry"
        elif "speaker" in features_str or "headphone" in features_str:
            data["device_type"] = "Audio Device"
            data["device_category"] = "Audio"
        elif "antenna" in features_str:
            data["device_type"] = "Router"
            data["device_category"] = "Networking"
        else:
            data["device_type"] = "Electronic Device"
            data["device_category"] = "Other"

    data["reuse_score"] = max(0, min(100, data.get("reuse_score", 30)))
    data["repair_score"] = max(0, min(100, data.get("repair_score", 40)))
    data["recycle_score"] = max(0, min(100, data.get("recycle_score", 70)))
    data["repairability_score"] = max(0, min(100, data.get("repairability_score", 50)))

    # Confidence: clamp + sane default if model omitted it
    try:
        data["identification_confidence"] = max(0, min(100, int(round(float(data.get("identification_confidence", 70))))))
    except (TypeError, ValueError):
        data["identification_confidence"] = 70

    # Visual observations: ensure all checklist booleans always exist
    observations = data.get("visual_observations", {}) or {}
    observations.setdefault("physical_damage", [])
    observations.setdefault("visible_components", [])
    observations.setdefault("overall_appearance", "Unknown")
    observations.setdefault("distinguishing_features", [])
    observations.setdefault("is_screen_cracked", False)
    observations.setdefault("has_physical_impact_damage", False)
    observations.setdefault("is_stand_or_housing_intact", True)
    observations.setdefault("has_missing_parts", False)

    if "is_severely_damaged" not in observations:
        observations["is_severely_damaged"] = bool(
            observations["is_screen_cracked"]
            or observations["has_physical_impact_damage"]
            or observations["has_missing_parts"]
            or observations["overall_appearance"] in ("Burned", "Corroded", "Damaged")
        )
    data["visual_observations"] = observations

    # Possible causes: always have at least a sane fallback set
    causes = data.get("possible_causes")
    if not causes or not isinstance(causes, list):
        if observations.get("is_severely_damaged"):
            causes = [
                {"cause": "Display Panel Failure", "likelihood": 80},
                {"cause": "Main Logic Board Issue", "likelihood": 45},
                {"cause": "Power Supply Fault", "likelihood": 35},
            ]
        else:
            causes = [
                {"cause": "Power Supply Fault", "likelihood": 40},
                {"cause": "Loose Internal Cable", "likelihood": 25},
                {"cause": "Main Logic Board Issue", "likelihood": 15},
            ]
    cleaned_causes = []
    for c in causes:
        try:
            cleaned_causes.append({
                "cause": str(c.get("cause", "Unknown cause")),
                "likelihood": max(0, min(100, int(round(float(c.get("likelihood", 0)))))),
            })
        except (TypeError, ValueError, AttributeError):
            continue
    cleaned_causes.sort(key=lambda c: c["likelihood"], reverse=True)
    data["possible_causes"] = cleaned_causes[:5]

    return data


def _extract_partial_data(raw_response: str) -> Dict:
    """Extract partial data from malformed JSON"""
    default = _get_default_analysis()

    type_match = re.search(r'"device_type"\s*:\s*"([^"]+)"', raw_response)
    if type_match:
        default["device_type"] = type_match.group(1)

    condition_match = re.search(r'"condition"\s*:\s*"([^"]+)"', raw_response)
    if condition_match:
        default["condition"] = condition_match.group(1)

    rec_match = re.search(r'"recommendation"\s*:\s*"([^"]+)"', raw_response)
    if rec_match:
        default["recommendation"] = rec_match.group(1)

    return default


def _get_default_analysis() -> Dict:
    """Return default analysis when AI fails"""
    return {
        "device_type": "Electronic Device",
        "device_category": "Other",
        "brand": "Unknown",
        "identification_confidence": 50,
        "estimated_age": "Unknown",
        "condition": "Fair",
        "reuse_score": 30,
        "repair_score": 40,
        "recycle_score": 70,
        "repairability_score": 50,
        "components": [],
        "materials": {
            "copper_grams": 50,
            "aluminium_grams": 100,
            "gold_mg": 5,
            "silver_grams": 2,
            "plastic_grams": 200,
            "glass_grams": 0,
            "rubber_grams": 0,
            "steel_grams": 0
        },
        "recommendation": "Recycle",
        "recommendation_reason": "Device could not be specifically identified. Recommended for material recovery.",
        "visual_observations": {
            "physical_damage": ["Unknown"],
            "visible_components": ["Electronic components"],
            "overall_appearance": "Unknown",
            "distinguishing_features": [],
            "is_screen_cracked": False,
            "has_physical_impact_damage": False,
            "is_stand_or_housing_intact": True,
            "has_missing_parts": False,
            "is_severely_damaged": False,
        },
        "possible_causes": [
            {"cause": "Main Logic Board Issue", "likelihood": 30},
            {"cause": "Power Supply Fault", "likelihood": 25},
        ],
    }


def _enforce_score_recommendation_consistency(data: Dict) -> Dict:
    try:
        reuse = float(data.get("reuse_score", 0))
        repair = float(data.get("repair_score", 0))
        recycle = float(data.get("recycle_score", 0))
        repairability = float(data.get("repairability_score", 0))
    except (TypeError, ValueError):
        return data

    if reuse >= 70:
        expected = "Reuse"
    elif repair >= 60:
        expected = "Repair"
    elif reuse >= 40 or repairability >= 50:
        expected = "Refurbish"
    else:
        expected = "Recycle"

    scores = {"Reuse": reuse, "Repair": repair, "Refurbish": repairability, "Recycle": recycle}
    top_action = max(scores, key=scores.get)
    if top_action == "Recycle" and expected != "Recycle":
        expected = "Recycle"

    if data.get("recommendation") != expected:
        logger.warning(f"Correcting recommendation from {data.get('recommendation')} to {expected}")
        data["recommendation"] = expected

    return data


def find_marketplace_partners(device_type: str, condition: str, location: str) -> List[Dict]:
    priority_types = []
    if condition in ("Good", "Excellent"):
        priority_types = ["NGO", "School"]

    prompt = f"""
You are an e-waste marketplace coordinator in India.

Device: {device_type}
Condition: {condition}
Location: {location}

Suggest 4 realistic partners who would accept this device, one of each type:
Recycler, NGO, Refurbisher, Collection Center.
{'- Prioritize NGOs and Schools' if priority_types else ''}

Respond ONLY with a JSON array:
[
  {{
    "name": "Organization name",
    "type": "Recycler | NGO | Refurbisher | Collection Center",
    "location": "City, State",
    "contact": "Phone or email",
    "accepts": "What they accept",
    "distance_km": 0-50
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


def generate_passport_info(device_data: Dict) -> str:
    prompt = f"""
You are an IoT predictive-maintenance AI.

Device data: {json.dumps(device_data)}

Write ONE concise paragraph (≤ 60 words) predicting the most likely component to fail next,
when it might fail, and recommending a proactive action.
Do NOT use bullet points or markdown.
"""

    response = client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
        temperature=0.4,
    )

    return response.choices[0].message.content.strip()


def generate_passport_qr(passport_id: str, device_data: Dict) -> str:
    return f"https://ecoview.ai/passport/{passport_id}"


def chat_with_green_assistant(question: str, device_context: Optional[Dict] = None) -> str:
    context = ""
    if device_context:
        context = f"\nDevice Context:\nDevice: {device_context.get('device_type')}\n"
        context += f"Brand: {device_context.get('brand')}\n"
        context += f"Condition: {device_context.get('condition')}\n"
        context += f"Recommendation: {device_context.get('recommendation')}\n"
        context += f"EcoScore: {device_context.get('eco_score', 'N/A')}\n"
        if device_context.get('user_problem'):
            context += f"User Problem: {device_context.get('user_problem')}\n"

    prompt = f"""
You are EcoView AI's Green Assistant - an expert in e-waste management, recycling, and circular economy.
Your goal is to help users understand e-waste, make better decisions, and protect the environment.

{context}

User Question: {question}

Provide a helpful, informative, and practical response. Include specific advice, estimated costs if relevant, and environmental impact information.
Keep the response conversational but informative.
"""

    response = client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.5,
    )

    return response.choices[0].message.content.strip()


def generate_repair_manual(device_type: str, repair_type: str) -> str:
    prompt = f"""
Create a detailed, step-by-step repair manual for a {device_type} for the following repair:
{repair_type}

Include:
1. Required tools
2. Estimated time
3. Difficulty level (1-10)
4. Step-by-step instructions with clear actions
5. Safety warnings
6. Common mistakes to avoid

Format as a clear, structured guide suitable for a technician.
"""

    response = client.chat.completions.create(
        model=TEXT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600,
        temperature=0.3,
    )

    return response.choices[0].message.content.strip()
