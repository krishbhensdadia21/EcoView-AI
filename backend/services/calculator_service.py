"""
Calculator Service
──────────────────
Converts raw material weights into ₹ value,
carbon savings, and water savings.
"""

# ── Material price table (₹ per gram, updated late June 2026) ────
# Basis: scrap/e-waste RECOVERY rates, not retail/bullion spot rates.
# Copper & aluminium: midpoint of current Indian scrap-market ranges.
# Gold & silver: spot bullion price × ~60% recovery discount, reflecting
#   typical e-waste refining yield/loss and informal-market payout.
#   Re-check periodically — copper, gold, and silver move daily.
MATERIAL_PRICES_INR = {
    "copper_grams":    0.95,   # scrap copper ~₹850-1,100/kg
    "aluminium_grams": 0.10,   # mixed/cast scrap ~₹80-105/kg
    "gold_mg":         8.66,   # 24K spot ~₹14,433/g × 0.60 ÷ 1000
    "silver_grams":    147.0,  # spot ~₹245/g × 0.60
    "plastic_grams":   0.02,
}

# ── Carbon & water savings by device type (reuse vs new mfg) ──
# NOTE ON ACCURACY: unlike the price table above, there is no live feed
# for embodied carbon/water — these are mid-range estimates synthesized
# from published life-cycle-assessment (LCA) studies (academic papers,
# Dell/HP/Lenovo product carbon footprints, UN Digital Economy Report).
# Credible sources disagree by 2-10x depending on methodology (cradle-to-
# gate vs cradle-to-grave, direct vs indirect water use, device spec).
# E.g. laptop mfg-phase CO2 estimates range ~90-585 kg across studies;
# smartphone mfg CO2 ranges ~16-80 kg; water figures vary even more.
# Treat these as directional/illustrative, not authoritative figures —
# cite a specific LCA source if this needs to hold up to scrutiny.
DEVICE_IMPACT = {
    "Laptop":   {"carbon_kg": 250,  "water_liters": 1200},
    "Mobile":   {"carbon_kg": 70,   "water_liters": 800},
    "Desktop":  {"carbon_kg": 400,  "water_liters": 1500},
    "Monitor":  {"carbon_kg": 150,  "water_liters": 600},
    "Printer":  {"carbon_kg": 80,   "water_liters": 400},
    "GPU":      {"carbon_kg": 120,  "water_liters": 700},
    "Keyboard": {"carbon_kg": 20,   "water_liters": 100},
    "Default":  {"carbon_kg": 100,  "water_liters": 500},
}


def calculate_material_value(materials: dict) -> float:
    """
    Returns total recoverable material value in ₹.
    materials = { "copper_grams": 120, "gold_mg": 50, ... }
    """
    total = 0.0
    for key, qty in materials.items():
        price = MATERIAL_PRICES_INR.get(key, 0)
        total += qty * price
    return round(total, 2)


def calculate_environmental_savings(device_type: str,
                                     recommendation: str) -> dict:
    """
    Returns carbon_saved_kg and water_saved_liters based on
    whether the device is reused / repaired vs. recycled.

    Reuse / Repair / Refurbish  → full savings (avoided new purchase)
    Recycle                     → 40 % of full savings (material recovery only)
    """
    impact = DEVICE_IMPACT.get(device_type, DEVICE_IMPACT["Default"])

    factor = 1.0 if recommendation in ("Reuse", "Repair", "Refurbish") else 0.4

    return {
        "carbon_saved_kg":    round(impact["carbon_kg"]    * factor, 1),
        "water_saved_liters": round(impact["water_liters"] * factor, 1),
    }