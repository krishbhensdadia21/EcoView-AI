# /backend/app/services/insights_service.py
"""
AI Procurement Insights Service
"""

import json
import logging
from typing import Dict, List, Any
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
TEXT_MODEL = "llama-3.3-70b-versatile"

# ADD THIS FUNCTION - it was missing
def get_insights(question: str, dashboard_data: Dict) -> Dict:
    """
    Answer questions about e-waste data using AI
    """
    context = f"""
Current E-Waste Statistics:
- Total Devices Scanned: {dashboard_data.get('total_devices_scanned', 0)}
- Total CO₂ Saved: {dashboard_data.get('total_carbon_saved_kg', 0)} kg
- Total Material Value Recovered: ₹{dashboard_data.get('total_material_value_inr', 0)}
- Average EcoScore: {dashboard_data.get('average_eco_score', 0)}/100
- Total EcoPoints Earned: {dashboard_data.get('total_eco_points_earned', 0)}

Device Breakdown:
{json.dumps(dashboard_data.get('device_breakdown', {}), indent=2)}

Hotspots (Top 5):
{json.dumps(dashboard_data.get('hotspots', [])[:5], indent=2)}

Manufacturer Breakdown:
{json.dumps(dashboard_data.get('manufacturer_breakdown', {}), indent=2)}
"""
    
    prompt = f"""
You are an AI procurement and policy analyst for e-waste management in India.
Based on the following data, answer the user's question with specific, actionable insights.

{context}

User Question: {question}

Provide:
1. Direct answer based on available data
2. Specific numbers and facts
3. Actionable recommendations
4. If the data doesn't fully answer, suggest what additional data would help

Keep the response professional, concise, and data-driven.
"""
    
    try:
        response = client.chat.completions.create(
            model=TEXT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.3,
        )
        
        return {
            "question": question,
            "answer": response.choices[0].message.content.strip(),
            "timestamp": "2026-06-26T12:00:00Z"
        }
    except Exception as e:
        logger.error(f"Insights generation failed: {e}")
        return {
            "question": question,
            "answer": "I'm sorry, I couldn't generate insights at the moment. Please try again later.",
            "error": str(e)
        }

# ADD THIS FUNCTION - it was missing
def generate_procurement_recommendations(dashboard_data: Dict) -> List[Dict]:
    """
    Generate automatic procurement recommendations based on data
    """
    device_breakdown = dashboard_data.get('device_breakdown', {})
    hotspots = dashboard_data.get('hotspots', [])
    manufacturer_data = dashboard_data.get('manufacturer_breakdown', {})
    
    recommendations = []
    
    if device_breakdown:
        max_device = max(device_breakdown, key=device_breakdown.get)
        if device_breakdown.get(max_device, 0) > 100:
            recommendations.append({
                "priority": "High",
                "category": "Collection",
                "recommendation": f"Focus collection efforts on {max_device}s - they represent {device_breakdown[max_device]} devices",
                "impact": "Could increase collection efficiency by 30%"
            })
    
    if hotspots and len(hotspots) >= 3:
        top_hotspot = hotspots[0]
        recommendations.append({
            "priority": "Medium",
            "category": "Infrastructure",
            "recommendation": f"Establish new collection center in {top_hotspot['location']} - currently highest e-waste generation",
            "impact": f"Could recover ₹{top_hotspot['count'] * 500:,} in materials"
        })
    
    if manufacturer_data:
        sorted_brands = sorted(manufacturer_data.items(), key=lambda x: x[1]['count'], reverse=True)
        if sorted_brands:
            top_brand = sorted_brands[0]
            recommendations.append({
                "priority": "Medium",
                "category": "Policy",
                "recommendation": f"Engage with {top_brand[0]} for EPR compliance - they have {top_brand[1]['count']} devices in the system",
                "impact": "Could improve brand accountability and recycling rates"
            })
    
    avg_eco_score = dashboard_data.get('average_eco_score', 0)
    if avg_eco_score < 60:
        recommendations.append({
            "priority": "High",
            "category": "Education",
            "recommendation": "Launch awareness campaigns to improve device repairability and reuse",
            "impact": f"Could increase average EcoScore from {avg_eco_score} to {min(100, avg_eco_score + 20)}"
        })
    
    return recommendations[:5]