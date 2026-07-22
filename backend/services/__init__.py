# /backend/app/services/__init__.py
from .groq_service import *
from .calculator_service import *
from .firebase_service import *
from .insights_service import *

__all__ = [
    'analyze_ewaste_image',
    'find_marketplace_partners',
    'generate_passport_info',
    'generate_passport_qr',
    'chat_with_green_assistant',
    'generate_repair_manual',
    'calculate_material_value',
    'calculate_environmental_savings',
    'calculate_eco_score',
    'segment_components',
    'predict_repair_costs',
    'predict_buyback_price',
    'predict_remaining_life',
    'calculate_eco_points',
    'detect_fraud',
    'predict_future_hotspots',
    'simulate_impact',
    'save_scan_result',
    'get_scan_result',
    'get_dashboard_stats',
    'get_manufacturer_data',
    'get_insights',
    'generate_procurement_recommendations'
]