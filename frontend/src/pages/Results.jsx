import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HealthScore       from "../components/HealthScore";
import MaterialRecovery  from "../components/MaterialRecovery";
import CarbonSavings     from "../components/CarbonSavings";
import Marketplace       from "../components/Marketplace";
import { QrCode, ArrowLeft } from "lucide-react";

// Recommendation badge colours
const REC_COLOURS = {
  Reuse:     "bg-green-100  text-green-700  border-green-300",
  Repair:    "bg-blue-100   text-blue-700   border-blue-300",
  Refurbish: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Recycle:   "bg-red-100    text-red-700    border-red-300",
};

export default function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("scanResult");
    if (!raw) { navigate("/scan"); return; }
    setResult(JSON.parse(raw));
  }, [navigate]);

  if (!result) return null;

  const recColour = REC_COLOURS[result.recommendation] || REC_COLOURS.Recycle;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Back */}
      <button onClick={() => navigate("/scan")}
              className="flex items-center gap-1 text-gray-500 hover:text-green-600
                         text-sm transition-colors">
        <ArrowLeft size={16} /> Back to scan
      </button>

      {/* Device Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Device Detected
            </p>
            <h2 className="text-2xl font-bold text-gray-800">
              {result.brand !== "Unknown" ? `${result.brand} ` : ""}
              {result.device_type}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Age: {result.estimated_age} &nbsp;·&nbsp; Condition: {result.condition}
            </p>
          </div>

          {/* Recommendation badge */}
          <div className={`border rounded-xl px-5 py-3 text-center ${recColour}`}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5">
              Recommendation
            </p>
            <p className="text-2xl font-extrabold">{result.recommendation}</p>
          </div>
        </div>

        {/* Reason */}
        <p className="mt-4 text-gray-600 text-sm bg-gray-50 rounded-lg p-3">
          💡 {result.recommendation_reason}
        </p>

        {/* Digital Passport */}
        <div className="mt-4 flex items-center gap-3 bg-emerald-50 rounded-lg p-3">
          <QrCode className="text-emerald-600" size={28} />
          <div>
            <p className="text-xs text-gray-500">Digital Product Passport</p>
            <p className="font-mono font-bold text-emerald-700 text-lg">
              #{result.passport_id}
            </p>
          </div>
          {result.passport_note && (
            <p className="text-xs text-gray-500 ml-4 flex-1 italic">
              {result.passport_note}
            </p>
          )}
        </div>
      </div>

      {/* Scores */}
      <HealthScore result={result} />

      {/* Material Recovery */}
      <MaterialRecovery
        materials={result.materials}
        valueInr={result.material_value_inr}
      />

      {/* Carbon Savings */}
      <CarbonSavings
        carbonKg={result.carbon_saved_kg}
        waterLiters={result.water_saved_liters}
      />

      {/* Marketplace */}
      <Marketplace partners={result.matched_partners} />
    </main>
  );
}