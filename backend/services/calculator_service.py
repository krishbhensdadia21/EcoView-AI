# /backend/app/services/calculator_service.py
"""
Enhanced Calculator Service with Device-Specific Components
"""

import random
import math
from typing import Dict, List, Tuple

# ── Material prices ────────────────────────────
MATERIAL_PRICES_INR = {
    "copper_grams": 0.95,
    "aluminium_grams": 0.10,
    "gold_mg": 8.66,
    "silver_grams": 147.0,
    "plastic_grams": 0.02,
    "glass_grams": 0.01,
    "rubber_grams": 0.005,
    "steel_grams": 0.03,
}

# ── DEVICE-SPECIFIC COMPONENTS ─────────────────
DEVICE_COMPONENTS = {
    "Monitor": {
        "components": [
            {"name": "Screen Panel", "material": "glass", "weight_g": 5000, "value_per_kg": 5},
            {"name": "Circuit Board", "material": "circuit", "weight_g": 200, "value_per_kg": 200},
            {"name": "Copper Wiring", "material": "metal", "weight_g": 100, "value_per_kg": 950},
            {"name": "Aluminium Frame", "material": "metal", "weight_g": 800, "value_per_kg": 100},
            {"name": "Plastic Casing", "material": "plastic", "weight_g": 1500, "value_per_kg": 20},
            {"name": "Power Supply", "material": "circuit", "weight_g": 300, "value_per_kg": 150},
        ],
        "repairs": {
            "Screen Replacement": {"cost": 5000, "difficulty": 8},
            "Power Supply Repair": {"cost": 1500, "difficulty": 5},
            "Circuit Board Repair": {"cost": 2000, "difficulty": 6},
        },
        "expected_lifetime": 8,
        "base_price": 5000,
        "impact": {"carbon_kg": 150, "water_liters": 600},
        "failure_probs": {
            "screen": 0.6,
            "power_supply": 0.4,
            "circuit_board": 0.2,
            "fan": 0.1,
        }
    },
    "Laptop": {
        "components": [
            {"name": "Battery", "material": "metal", "weight_g": 300, "value_per_kg": 50},
            {"name": "RAM", "material": "circuit", "weight_g": 20, "value_per_kg": 200},
            {"name": "SSD", "material": "circuit", "weight_g": 50, "value_per_kg": 150},
            {"name": "Motherboard", "material": "circuit", "weight_g": 150, "value_per_kg": 300},
            {"name": "Copper", "material": "metal", "weight_g": 100, "value_per_kg": 950},
            {"name": "Aluminium", "material": "metal", "weight_g": 500, "value_per_kg": 100},
            {"name": "Plastic", "material": "plastic", "weight_g": 300, "value_per_kg": 20},
            {"name": "Screen", "material": "glass", "weight_g": 200, "value_per_kg": 5},
        ],
        "repairs": {
            "Battery Replacement": {"cost": 1200, "difficulty": 3},
            "Screen Replacement": {"cost": 4200, "difficulty": 7},
            "Motherboard Repair": {"cost": 8500, "difficulty": 9},
            "RAM Upgrade": {"cost": 2500, "difficulty": 2},
            "SSD Replacement": {"cost": 3000, "difficulty": 2},
        },
        "expected_lifetime": 5,
        "base_price": 15000,
        "impact": {"carbon_kg": 250, "water_liters": 1200},
        "failure_probs": {
            "battery": 0.5,
            "motherboard": 0.3,
            "ssd": 0.2,
            "fan": 0.3,
            "screen": 0.2,
        }
    },
    "Mobile": {
        "components": [
            {"name": "Battery", "material": "metal", "weight_g": 50, "value_per_kg": 50},
            {"name": "Motherboard", "material": "circuit", "weight_g": 30, "value_per_kg": 300},
            {"name": "Copper", "material": "metal", "weight_g": 20, "value_per_kg": 950},
            {"name": "Gold", "material": "precious", "weight_g": 0.05, "value_per_kg": 8660},
            {"name": "Silver", "material": "precious", "weight_g": 1, "value_per_kg": 147000},
            {"name": "Plastic", "material": "plastic", "weight_g": 40, "value_per_kg": 20},
            {"name": "Glass/Screen", "material": "glass", "weight_g": 30, "value_per_kg": 5},
        ],
        "repairs": {
            "Battery Replacement": {"cost": 800, "difficulty": 4},
            "Screen Replacement": {"cost": 3000, "difficulty": 8},
            "Charging Port Repair": {"cost": 1000, "difficulty": 5},
            "Camera Repair": {"cost": 1500, "difficulty": 6},
        },
        "expected_lifetime": 3,
        "base_price": 8000,
        "impact": {"carbon_kg": 70, "water_liters": 800},
        "failure_probs": {
            "battery": 0.6,
            "motherboard": 0.2,
            "screen": 0.5,
        }
    },
    "Desktop": {
        "components": [
            {"name": "Power Supply", "material": "metal", "weight_g": 800, "value_per_kg": 50},
            {"name": "Motherboard", "material": "circuit", "weight_g": 300, "value_per_kg": 300},
            {"name": "RAM", "material": "circuit", "weight_g": 50, "value_per_kg": 200},
            {"name": "GPU", "material": "circuit", "weight_g": 500, "value_per_kg": 350},
            {"name": "Copper", "material": "metal", "weight_g": 300, "value_per_kg": 950},
            {"name": "Aluminium", "material": "metal", "weight_g": 1000, "value_per_kg": 100},
            {"name": "Plastic", "material": "plastic", "weight_g": 500, "value_per_kg": 20},
            {"name": "Steel", "material": "metal", "weight_g": 1500, "value_per_kg": 30},
        ],
        "repairs": {
            "PSU Replacement": {"cost": 2000, "difficulty": 3},
            "Motherboard Repair": {"cost": 5000, "difficulty": 7},
            "RAM Upgrade": {"cost": 2000, "difficulty": 1},
            "GPU Repair": {"cost": 4000, "difficulty": 6},
        },
        "expected_lifetime": 7,
        "base_price": 12000,
        "impact": {"carbon_kg": 400, "water_liters": 1500},
        "failure_probs": {
            "motherboard": 0.3,
            "ssd": 0.2,
            "fan": 0.4,
            "power_supply": 0.3,
        }
    },
    "Keyboard": {
        "components": [
            {"name": "Circuit Board", "material": "circuit", "weight_g": 50, "value_per_kg": 200},
            {"name": "Copper", "material": "metal", "weight_g": 20, "value_per_kg": 950},
            {"name": "Plastic", "material": "plastic", "weight_g": 500, "value_per_kg": 20},
            {"name": "Rubber/Silicone", "material": "rubber", "weight_g": 50, "value_per_kg": 5},
        ],
        "repairs": {
            "Key Replacement": {"cost": 500, "difficulty": 2},
            "Circuit Board Repair": {"cost": 800, "difficulty": 4},
        },
        "expected_lifetime": 3,
        "base_price": 1000,
        "impact": {"carbon_kg": 20, "water_liters": 100},
        "failure_probs": {
            "circuit_board": 0.3,
            "keys": 0.5,
        }
    },
    "Default": {
        "components": [
            {"name": "Circuit Board", "material": "circuit", "weight_g": 50, "value_per_kg": 200},
            {"name": "Copper", "material": "metal", "weight_g": 50, "value_per_kg": 950},
            {"name": "Plastic", "material": "plastic", "weight_g": 200, "value_per_kg": 20},
            {"name": "Aluminium", "material": "metal", "weight_g": 100, "value_per_kg": 100},
        ],
        "repairs": {},
        "expected_lifetime": 4,
        "base_price": 5000,
        "impact": {"carbon_kg": 100, "water_liters": 500},
        "failure_probs": {
            "circuit_board": 0.3,
            "battery": 0.2,
        }
    }
}

# ── Condition multipliers ────────────────────
CONDITION_MULTIPLIERS = {
    "Excellent": 1.0,
    "Good": 0.8,
    "Fair": 0.5,
    "Poor": 0.3,
}

# ── Brand multipliers ─────────────────────────
BRAND_MULTIPLIERS = {
    "Apple": 1.4,
    "Samsung": 1.2,
    "Dell": 1.1,
    "HP": 1.0,
    "Lenovo": 1.0,
    "Asus": 1.0,
    "Acer": 0.9,
    "Sony": 1.1,
    "LG": 1.0,
    "Microsoft": 1.2,
    "Unknown": 0.8,
}

def get_device_config(device_type: str) -> Dict:
    """Get device-specific configuration"""
    device_type_lower = device_type.lower()
    
    for key in DEVICE_COMPONENTS:
        if key.lower() == device_type_lower:
            return DEVICE_COMPONENTS[key]
    
    for key in DEVICE_COMPONENTS:
        if key.lower() in device_type_lower or device_type_lower in key.lower():
            return DEVICE_COMPONENTS[key]
    
    return DEVICE_COMPONENTS["Default"]

def classify_device_from_materials(materials: Dict) -> Dict:
    """Classify device type based on material composition"""
    total_weight = sum(materials.values())
    if total_weight == 0:
        return {"device_type": "Unknown", "confidence": 0}
    
    copper_ratio = materials.get("copper_grams", 0) / total_weight
    plastic_ratio = materials.get("plastic_grams", 0) / total_weight
    aluminium_ratio = materials.get("aluminium_grams", 0) / total_weight
    gold_mg = materials.get("gold_mg", 0)
    silver_grams = materials.get("silver_grams", 0)
    glass_ratio = materials.get("glass_grams", 0) / total_weight
    
    classifications = []
    
    if copper_ratio > 0.3:
        classifications.append({"type": "Desktop/Computer", "confidence": 0.7})
    if plastic_ratio > 0.5:
        classifications.append({"type": "Consumer Electronic", "confidence": 0.6})
    if gold_mg > 10:
        classifications.append({"type": "Premium Device (Mobile/Laptop)", "confidence": 0.8})
    if silver_grams > 5:
        classifications.append({"type": "Circuit Board", "confidence": 0.7})
    if glass_ratio > 0.2:
        classifications.append({"type": "Display Device", "confidence": 0.7})
    if aluminium_ratio > 0.3:
        classifications.append({"type": "Laptop/Desktop", "confidence": 0.6})
    if 0.2 < copper_ratio < 0.4 and 0.3 < plastic_ratio < 0.6:
        classifications.append({"type": "General Electronic Device", "confidence": 0.5})
    
    if classifications:
        best = max(classifications, key=lambda x: x["confidence"])
        return {
            "device_type": best["type"],
            "confidence": best["confidence"],
            "alternatives": [c["type"] for c in classifications if c != best]
        }
    
    return {"device_type": "Unknown Electronic Device", "confidence": 0.3}

def calculate_material_value(materials: Dict) -> float:
    total = 0.0
    for key, qty in materials.items():
        price = MATERIAL_PRICES_INR.get(key, 0)
        total += qty * price
    return round(total, 2)

def calculate_environmental_savings(device_type: str, recommendation: str) -> Dict:
    device_config = get_device_config(device_type)
    impact = device_config.get("impact", {"carbon_kg": 100, "water_liters": 500})
    factor = 1.0 if recommendation in ("Reuse", "Repair", "Refurbish") else 0.4

    # Landfill reduction: weight of the device that is diverted from landfill,
    # estimated from the device's component template weight (kg).
    device_weight_kg = sum(
        comp["weight_g"] for comp in device_config.get("components", [])
    ) / 1000
    if device_weight_kg <= 0:
        device_weight_kg = 3.5
    landfill_factor = 1.0 if recommendation == "Recycle" else 0.7

    return {
        "carbon_saved_kg": round(impact["carbon_kg"] * factor, 1),
        "water_saved_liters": round(impact["water_liters"] * factor, 1),
        "landfill_reduction_kg": round(device_weight_kg * landfill_factor, 1),
    }

def calculate_eco_score(analysis: Dict) -> Dict:
    reuse = analysis.get("reuse_score", 0)
    repair = analysis.get("repair_score", 0)
    recycle = analysis.get("recycle_score", 0)
    repairability = analysis.get("repairability_score", 0)
    
    carbon_saved = analysis.get("carbon_saved_kg", 0)
    device_type = analysis.get("device_type", "Default")
    device_config = get_device_config(device_type)
    max_carbon = device_config.get("impact", {}).get("carbon_kg", 100)
    carbon_score = min(100, (carbon_saved / max_carbon) * 100) if max_carbon > 0 else 50
    
    material_value = analysis.get("material_value_inr", 0)
    max_value = 5000
    material_score = min(100, (material_value / max_value) * 100)
    
    weights = {
        "reuse": 0.25,
        "repair": 0.15,
        "recycle": 0.10,
        "repairability": 0.20,
        "carbon": 0.15,
        "material": 0.15
    }
    
    eco_score = (
        reuse * weights["reuse"] +
        repair * weights["repair"] +
        recycle * weights["recycle"] +
        repairability * weights["repairability"] +
        carbon_score * weights["carbon"] +
        material_score * weights["material"]
    )
    
    return {
        "eco_score": round(eco_score),
        "breakdown": {
            "reuse_score": reuse,
            "repair_score": repair,
            "recycle_score": recycle,
            "repairability_score": repairability,
            "carbon_efficiency": round(carbon_score),
            "material_recovery": round(material_score),
        }
    }

def segment_components(device_type: str, materials: Dict) -> List[Dict]:
    """Segment components based on device type"""
    device_config = get_device_config(device_type)
    component_template = device_config.get("components", [])
    
    total_actual_weight = sum(materials.values())
    if total_actual_weight < 10:
        total_actual_weight = sum([comp["weight_g"] for comp in component_template])
    
    total_template_weight = sum([comp["weight_g"] for comp in component_template])
    scale_factor = total_actual_weight / total_template_weight if total_template_weight > 0 else 1
    
    components = []
    for comp_template in component_template:
        scaled_weight = comp_template["weight_g"] * scale_factor
        value = (scaled_weight / 1000) * comp_template["value_per_kg"]
        
        components.append({
            "name": comp_template["name"],
            "weight_grams": round(scaled_weight, 2),
            "material": comp_template["material"],
            "recoverable_value_inr": round(value, 2),
            "condition": "Fair",
            "is_removable": comp_template["name"] not in ["Screen Panel", "Frame", "Casing"],
        })
    
    return components

def predict_repair_costs(device_type: str, condition: str, age: str) -> Dict:
    """Predict repair costs with device-specific repair options"""
    device_config = get_device_config(device_type)
    repairs = device_config.get("repairs", {})
    
    if not repairs:
        return {}
    
    age_years = 3
    try:
        if "year" in age:
            age_years = float(age.split("-")[0]) if "-" in age else float(age.split()[0])
        elif "month" in age:
            age_years = float(age.split()[0]) / 12
    except:
        pass
    
    condition_multiplier = CONDITION_MULTIPLIERS.get(condition, 1.0)
    age_multiplier = 1 + (age_years * 0.1)
    
    results = {}
    for repair_name, details in repairs.items():
        base_probability = min(0.9, 0.1 + (age_years * 0.05))
        
        if condition == "Poor":
            base_probability = min(0.95, base_probability * 1.5)
        elif condition == "Excellent":
            base_probability = max(0.05, base_probability * 0.3)
        
        results[repair_name] = {
            "cost": round(details["cost"] * condition_multiplier * age_multiplier, -2),
            "probability": round(base_probability, 2),
            "difficulty": details["difficulty"],
            "estimated_time_hours": details["difficulty"] * 0.5,
        }
    
    return results

def summarize_repairability(device_type: str, condition: str, age: str, repairability_score: int, repair_estimates: Dict) -> Dict:
    """
    Collapse the per-repair-type breakdown into one Section-6 style summary:
    difficulty, a single cost range, success probability, and a worth-it flag.
    """
    device_config = get_device_config(device_type)

    if not repair_estimates:
        avg_difficulty = 10 - max(1, round(repairability_score / 10))
    else:
        avg_difficulty = sum(d.get("difficulty", 5) for d in repair_estimates.values()) / len(repair_estimates)

    if avg_difficulty >= 7:
        difficulty_label = "High"
    elif avg_difficulty >= 4:
        difficulty_label = "Medium"
    else:
        difficulty_label = "Low"

    if repair_estimates:
        costs = [d.get("cost", 0) for d in repair_estimates.values()]
        low, high = min(costs), max(costs)
    else:
        base = device_config.get("base_price", 5000)
        low, high = round(base * 0.15, -2), round(base * 0.30, -2)
    if low == high:
        high = low * 1.6

    condition_factor = {"Excellent": 0.9, "Good": 0.75, "Fair": 0.5, "Poor": 0.25}.get(condition, 0.5)
    repairability_factor = repairability_score / 100
    success_probability = round(max(5, min(95, condition_factor * repairability_factor * 100)))

    buyback = predict_buyback_price(device_type, "Unknown", condition, age)
    economically_worth_repair = (
        success_probability >= 50
        and buyback.get("potential_profit", 0) > 0
        and difficulty_label != "High"
    )

    return {
        "repair_difficulty": difficulty_label,
        "estimated_repair_cost_low": round(low),
        "estimated_repair_cost_high": round(high),
        "repair_success_probability": success_probability,
        "economically_worth_repair": economically_worth_repair,
    }


def predict_buyback_price(device_type: str, brand: str, condition: str, age: str) -> Dict:
    """Predict buyback price with device-specific base prices"""
    device_config = get_device_config(device_type)
    base_price = device_config.get("base_price", 5000)
    
    brand_multiplier = BRAND_MULTIPLIERS.get(brand, 1.0)
    condition_multiplier = CONDITION_MULTIPLIERS.get(condition, 0.5)
    
    age_years = 3
    try:
        if "year" in age:
            age_years = float(age.split("-")[0]) if "-" in age else float(age.split()[0])
        elif "month" in age:
            age_years = float(age.split()[0]) / 12
    except:
        pass
    
    depreciation = max(0.1, 1 - (age_years * 0.15))
    
    current_price = base_price * brand_multiplier * condition_multiplier * depreciation
    after_repair_price = base_price * brand_multiplier * 0.8 * depreciation
    
    repair_cost = 0
    repairs = device_config.get("repairs", {})
    if repairs:
        if condition == "Poor":
            repair_cost = min(repairs.values(), key=lambda x: x["cost"])["cost"] * 2
        elif condition == "Fair":
            repair_cost = min(repairs.values(), key=lambda x: x["cost"])["cost"] * 1.2
    
    profit = after_repair_price - current_price - repair_cost
    
    return {
        "current_price": round(current_price),
        "price_after_repair": round(after_repair_price),
        "estimated_repair_cost": round(repair_cost),
        "potential_profit": round(profit),
        "should_repair": profit > 500,
    }

def predict_remaining_life(device_type: str, condition: str, age: str, is_severely_damaged: bool = False, user_reported_dead: bool = False) -> Dict:
    """Predict remaining life with device-specific failure probabilities.

    Per spec: never predict a remaining-life number if the device is visibly
    destroyed (severe physical damage) or reported completely non-functional —
    return an "Unavailable" result with a reason instead.
    """
    if is_severely_damaged or user_reported_dead:
        reason = (
            "Critical physical damage detected."
            if is_severely_damaged
            else "Device reported non-functional; internal inspection required."
        )
        return {
            "remaining_life_months": None,
            "confidence_score": None,
            "component_failure_probabilities": {},
            "predicted_failure_component": "Unknown",
            "available": False,
            "unavailable_reason": reason,
        }

    device_config = get_device_config(device_type)
    
    age_years = 3
    try:
        if "year" in age:
            age_years = float(age.split("-")[0]) if "-" in age else float(age.split()[0])
        elif "month" in age:
            age_years = float(age.split()[0]) / 12
    except:
        pass
    
    expected_lifetime = device_config.get("expected_lifetime", 4)
    remaining_months = max(0, (expected_lifetime - age_years) * 12)
    
    condition_adjustment = CONDITION_MULTIPLIERS.get(condition, 1.0)
    remaining_months = remaining_months * condition_adjustment
    
    base_probs = device_config.get("failure_probs", {})
    
    adjusted_probs = {}
    for component, prob in base_probs.items():
        age_factor = 1 + (age_years * 0.1)
        if condition == "Poor":
            condition_factor = 1.5
        elif condition == "Excellent":
            condition_factor = 0.5
        else:
            condition_factor = 1.0
        
        adjusted_prob = min(0.95, prob * age_factor * condition_factor)
        adjusted_probs[component] = round(adjusted_prob, 2)
    
    confidence = max(50, min(95, 90 - (age_years * 5)))
    
    if adjusted_probs:
        predicted_failure = max(adjusted_probs, key=adjusted_probs.get)
    else:
        predicted_failure = "Unknown"
    
    return {
        "remaining_life_months": round(remaining_months),
        "confidence_score": round(confidence),
        "component_failure_probabilities": adjusted_probs,
        "predicted_failure_component": predicted_failure,
        "available": True,
        "unavailable_reason": None,
    }

def calculate_eco_points(device_data: Dict) -> int:
    """
    EcoPoints, rebalanced so the eco_score actually drives the score.

    Old formula: carbon_saved_kg*10 dominated everything (thousands of
    points) while eco_score*2 (max 200) and material_value*0.05 were
    rounding errors in comparison — despite eco_score already being a
    proper weighted blend of reuse/repair/recycle/repairability/carbon/
    material. This version makes eco_score the primary driver and turns
    carbon/material into small, CAPPED bonuses so a big/heavy device
    (Desktop, Monitor) doesn't automatically outscore a small one
    (Keyboard) just by virtue of its size.

    Also: missing eco_score now defaults to 0, not 50 — a caller that
    forgot to pass it should not get 100 free points.
    """
    carbon_saved = device_data.get("carbon_saved_kg", 0)
    material_value = device_data.get("material_value_inr", 0)
    eco_score = device_data.get("eco_score", 0)

    # Primary driver: eco_score (0-100) scaled up to a 0-1000 point range
    base_points = eco_score * 10

    # Secondary, capped bonuses — real impact still counts, but can't
    # dwarf the eco_score the way raw carbon_saved*10 used to
    carbon_bonus = min(carbon_saved * 2, 300)
    material_bonus = min(material_value * 0.02, 100)

    points = base_points + carbon_bonus + material_bonus

    # Bonus for choices that keep the device in use. Only "Reuse" and
    # "Refurbish" are checked because those are the only values the
    # recommendation engine actually produces ("Repair" was dead code —
    # it's never set as a recommendation anywhere in the app). Bonus
    # lowered from 1.5x to 1.2x since carbon_saved_kg already gets a
    # 2.5x boost for these same recommendations in
    # calculate_environmental_savings() — stacking a second 1.5x on top
    # of that was double-counting the same signal.
    if device_data.get("recommendation") in ("Reuse", "Refurbish"):
        points *= 1.2

    return round(points)

def detect_fraud(device_type: str, materials: Dict, location: str) -> Dict:
    device_config = get_device_config(device_type)
    component_template = device_config.get("components", [])
    
    typical_materials = {}
    for comp in component_template:
        material_type = comp["material"]
        if material_type not in typical_materials:
            typical_materials[material_type] = 0
        typical_materials[material_type] += comp["weight_g"]
    
    anomalies = []
    
    for material, claimed_weight in materials.items():
        claimed_kg = claimed_weight / 1000 if "mg" not in material else claimed_weight / 1000000
        
        expected_kg = 0
        for mat_type, weight in typical_materials.items():
            if mat_type in material:
                expected_kg = weight * 0.7
                break
        
        if expected_kg > 0:
            ratio = claimed_kg / expected_kg
            if ratio > 3 or ratio < 0.3:
                anomalies.append({
                    "material": material,
                    "claimed": round(claimed_kg, 3),
                    "expected": round(expected_kg, 3),
                    "deviation": f"{round((ratio - 1) * 100)}%"
                })
    
    return {
        "has_anomalies": len(anomalies) > 0,
        "anomalies": anomalies,
        "fraud_risk_score": min(100, len(anomalies) * 30),
        "recycler_reliability": "Verified" if len(anomalies) == 0 else "Suspicious"
    }

def predict_future_hotspots(current_hotspots: List[Dict]) -> List[Dict]:
    if not current_hotspots:
        return []
    
    predictions = []
    for hotspot in current_hotspots[:10]:
        location = hotspot["location"]
        current_count = hotspot["count"]
        
        next_month = round(current_count * 1.2)
        next_quarter = round(current_count * 1.5)
        
        predictions.append({
            "location": location,
            "current_count": current_count,
            "predicted_next_month": next_month,
            "predicted_next_quarter": next_quarter,
            "growth_rate": "20% per month",
            "reason": "Historical trend analysis"
        })
    
    return predictions

def simulate_impact(current_stats: Dict, policy_change: str, value: float) -> Dict:
    total_devices = current_stats.get("total_devices_scanned", 1000)
    total_carbon = current_stats.get("total_carbon_saved_kg", 1000)
    total_material = current_stats.get("total_material_value_inr", 10000)
    
    if "repair" in policy_change.lower():
        multiplier = 1 + (value / 100)
        new_carbon = total_carbon * multiplier
        new_material = total_material * multiplier
        new_devices = total_devices * multiplier
        jobs_created = round((total_devices * (value / 100)) / 100)
        
    elif "recycle" in policy_change.lower():
        multiplier = 1 + (value / 100)
        new_carbon = total_carbon * multiplier * 0.6
        new_material = total_material * multiplier
        new_devices = total_devices * multiplier
        jobs_created = round((total_devices * (value / 100)) / 200)
        
    elif "collection" in policy_change.lower():
        multiplier = 1 + (value / 100)
        new_devices = total_devices * multiplier
        new_carbon = total_carbon * multiplier
        new_material = total_material * multiplier
        jobs_created = round((total_devices * (value / 100)) / 50)
        
    else:
        multiplier = 1 + (value / 100)
        new_devices = total_devices * multiplier
        new_carbon = total_carbon * multiplier
        new_material = total_material * multiplier
        jobs_created = 0
    
    avg_water_per_device = 500
    water_saved = new_devices * avg_water_per_device
    
    return {
        "new_total_devices": round(new_devices),
        "new_carbon_saved_kg": round(new_carbon, 1),
        "new_material_value_inr": round(new_material, 2),
        "water_saved_liters": round(water_saved),
        "jobs_created": jobs_created,
        "improvement_percentage": round(((new_carbon - total_carbon) / total_carbon) * 100, 1) if total_carbon > 0 else 0,
    }

def build_passport_history(passport_id: str, ai_result: Dict) -> Dict:
    """
    Build the Circular Economy Passport record (Section 13).
    This is the device's first scan, so ownership/repair history starts empty —
    the structure is still returned so the frontend has a stable shape to render
    and append to on future scans of the same passport_id.
    """
    materials = ai_result.get("materials", {})
    material_composition = {
        key: qty for key, qty in materials.items() if qty and qty > 0
    }

    return {
        "passport_id": passport_id,
        "ownership_history": [
            {
                "event": "First Scan Registered",
                "owner": "Current User",
                "date": "Today",
            }
        ],
        "repair_history": [],
        "material_composition": material_composition,
    }